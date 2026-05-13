const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const obtener = async (id) => {
  const { data, error } = await supabase
    .from('evaluaciones')
    .select('*')
    .eq('id_evaluacion', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener evaluacion');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const registrar = async (id_usuario, { id_exposicion, detalles }) => {
  // RN09-2: usuario autenticado debe ser alumno con registro
  const { data: alumno } = await supabase
    .from('alumnos')
    .select('id_alumno, id_equipo')
    .eq('id_usuario', id_usuario)
    .maybeSingle();

  if (!alumno) throw new AppError(403, 'No tienes permiso para evaluar esta exposicion');

  // RN09-3: debe existir un permiso para el alumno y la exposicion
  const { data: permiso } = await supabase
    .from('permisos_evaluacion')
    .select('*')
    .eq('id_alumno', alumno.id_alumno)
    .eq('id_exposicion', id_exposicion)
    .maybeSingle();

  if (!permiso) throw new AppError(403, 'No tienes permiso para evaluar esta exposicion');

  // RN09-4: permiso debe estar habilitado
  if (!permiso.habilitado) throw new AppError(403, 'El permiso de evaluacion no esta habilitado');

  // RN09-5/6: verificar expiración solo en ventana normal (no aplica cuando el docente reabre)
  // Cuando el docente reabre, fecha_cierre = 2099 (centinela sin restricción de tiempo)
  const sinRestriccion = new Date(permiso.fecha_cierre) >= new Date('2099-01-01');
  if (!sinRestriccion && new Date() > new Date(permiso.fecha_cierre)) {
    throw new AppError(403, 'La ventana de evaluacion ha expirado');
  }

  // RN09-7: alumno no debe haber evaluado ya
  if (permiso.evaluado) throw new AppError(409, 'Ya has evaluado esta exposicion');

  // RN09-8: alumno no debe pertenecer al equipo expositor
  const { data: exposicion } = await supabase
    .from('exposiciones')
    .select('id_equipo')
    .eq('id_exposicion', id_exposicion)
    .maybeSingle();

  if (alumno.id_equipo === exposicion.id_equipo) {
    throw new AppError(403, 'No puedes evaluar la exposicion de tu propio equipo');
  }

  // RN09-9: criterios deben coincidir exactamente con los de la rubrica de la exposicion
  const { data: equipo } = await supabase
    .from('equipos')
    .select('id_grupo')
    .eq('id_equipo', exposicion.id_equipo)
    .maybeSingle();

  const { data: grupo } = await supabase
    .from('grupos')
    .select('id_materia')
    .eq('id_grupo', equipo.id_grupo)
    .maybeSingle();

  const { data: rubrica } = await supabase
    .from('rubricas')
    .select('id_rubrica')
    .eq('id_materia', grupo.id_materia)
    .maybeSingle();

  if (!rubrica) throw new AppError(400, 'La exposicion no tiene una rubrica asociada');

  const { data: criterios } = await supabase
    .from('criterios')
    .select('id_criterio, ponderacion')
    .eq('id_rubrica', rubrica.id_rubrica);

  const criteriosIds = new Set((criterios || []).map(c => c.id_criterio));
  const detallesIds = new Set(detalles.map(d => d.id_criterio));

  if (
    criteriosIds.size !== detallesIds.size ||
    [...detallesIds].some(id => !criteriosIds.has(id))
  ) {
    throw new AppError(400, 'Los criterios enviados no coinciden con los de la rubrica');
  }

  for (const d of detalles) {
    if (d.calificacion < 0 || d.calificacion > 10) {
      throw new AppError(400, 'La calificacion debe estar entre 0 y 10');
    }
  }

  // RN12: promedio ponderado SUM(calificacion * ponderacion) / SUM(ponderacion)
  const criterioMap = new Map((criterios || []).map(c => [c.id_criterio, c.ponderacion]));
  let sumaPonderada = 0;
  let sumaPonderaciones = 0;

  for (const d of detalles) {
    const pond = criterioMap.get(d.id_criterio);
    sumaPonderada += d.calificacion * pond;
    sumaPonderaciones += pond;
  }

  const promedio = sumaPonderaciones > 0 ? sumaPonderada / sumaPonderaciones : 0;

  const { data: evaluacion, error: evalError } = await supabase
    .from('evaluaciones')
    .insert({ id_alumno: alumno.id_alumno, id_exposicion, promedio })
    .select()
    .single();

  if (evalError) throw new AppError(500, 'Error al registrar evaluacion');

  const detallesInsert = detalles.map(d => ({
    id_evaluacion: evaluacion.id_evaluacion,
    id_criterio: d.id_criterio,
    calificacion: d.calificacion,
  }));

  const { error: detallesError } = await supabase
    .from('detalle_evaluacion')
    .insert(detallesInsert);

  if (detallesError) throw new AppError(500, 'Error al registrar detalles de evaluacion');

  await supabase
    .from('permisos_evaluacion')
    .update({ evaluado: true })
    .eq('id_permiso', permiso.id_permiso);

  return evaluacion;
};

const consultarResultados = async (id_exposicion) => {
  const { data: exposicion } = await supabase
    .from('exposiciones')
    .select('id_exposicion')
    .eq('id_exposicion', id_exposicion)
    .maybeSingle();

  if (!exposicion) throw new AppError(404, 'El recurso solicitado no existe');

  const { data: evaluaciones, error } = await supabase
    .from('evaluaciones')
    .select('*')
    .eq('id_exposicion', id_exposicion);

  if (error) throw new AppError(500, 'Error al obtener resultados');

  if (evaluaciones.length === 0) {
    return { id_exposicion, evaluaciones: [], criterios: {}, promedio_general: 0 };
  }

  const ids = evaluaciones.map(e => e.id_evaluacion);
  const { data: detalles, error: detallesError } = await supabase
    .from('detalle_evaluacion')
    .select('*, criterios(id_criterio, descripcion, ponderacion)')
    .in('id_evaluacion', ids);

  if (detallesError) throw new AppError(500, 'Error al obtener detalles de evaluacion');

  // Mapa criterio_id → { descripcion, ponderacion } extraído de los detalles
  const criteriosMap = {};
  for (const d of detalles || []) {
    if (d.criterios && !criteriosMap[d.id_criterio]) {
      criteriosMap[d.id_criterio] = {
        descripcion: d.criterios.descripcion,
        ponderacion: d.criterios.ponderacion,
      };
    }
  }

  const detallesPorEval = {};
  for (const d of detalles || []) {
    if (!detallesPorEval[d.id_evaluacion]) detallesPorEval[d.id_evaluacion] = [];
    detallesPorEval[d.id_evaluacion].push({
      id_detalle: d.id_detalle,
      id_evaluacion: d.id_evaluacion,
      id_criterio: d.id_criterio,
      calificacion: d.calificacion,
    });
  }

  const resultado = evaluaciones.map(e => ({
    ...e,
    detalles: detallesPorEval[e.id_evaluacion] || [],
  }));

  const promedio_general =
    evaluaciones.reduce((sum, e) => sum + e.promedio, 0) / evaluaciones.length;

  return {
    id_exposicion,
    evaluaciones: resultado,
    criterios: criteriosMap,
    promedio_general: Math.round(promedio_general * 100) / 100,
  };
};

module.exports = { obtener, registrar, consultarResultados };
