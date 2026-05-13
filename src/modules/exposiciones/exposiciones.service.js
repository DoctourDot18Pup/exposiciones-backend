const bcrypt = require('bcryptjs');
const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const obtener = async (id) => {
  const { data, error } = await supabase
    .from('exposiciones')
    .select('*')
    .eq('id_exposicion', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener exposicion');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const listar = async (user, page, size) => {
  const from = page * size;
  const to = from + size - 1;

  if (user.rol === 'docente') {
    const { data, error, count } = await supabase
      .from('exposiciones')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw new AppError(500, 'Error al obtener exposiciones');

    return {
      content: data,
      totalElements: count,
      totalPages: count === 0 ? 0 : Math.ceil(count / size),
      page,
      size,
    };
  }

  // Alumno: usar permisos_evaluacion como fuente de verdad (RN08 ya fue aplicado al habilitar)
  const { data: alumno } = await supabase
    .from('alumnos')
    .select('id_alumno')
    .eq('id_usuario', user.id_usuario)
    .maybeSingle();

  if (!alumno) throw new AppError(404, 'El recurso solicitado no existe');

  const { data: permisos, error: permisosError } = await supabase
    .from('permisos_evaluacion')
    .select('id_exposicion, evaluado')
    .eq('id_alumno', alumno.id_alumno)
    .eq('habilitado', true);

  if (permisosError) throw new AppError(500, 'Error al obtener exposiciones');

  const idsExposiciones = (permisos || []).map(p => p.id_exposicion);

  if (idsExposiciones.length === 0) {
    return { content: [], totalElements: 0, totalPages: 0, page, size };
  }

  const { data, error, count } = await supabase
    .from('exposiciones')
    .select('*', { count: 'exact' })
    .neq('estado', 'pendiente')
    .in('id_exposicion', idsExposiciones)
    .range(from, to);

  if (error) throw new AppError(500, 'Error al obtener exposiciones');

  // Adjuntar estado evaluado del permiso a cada exposicion
  const permisoMap = {};
  for (const p of permisos || []) permisoMap[p.id_exposicion] = p;

  const content = (data || []).map(exp => ({
    ...exp,
    _evaluado: permisoMap[exp.id_exposicion]?.evaluado ?? false,
  }));

  return {
    content,
    totalElements: count,
    totalPages: count === 0 ? 0 : Math.ceil(count / size),
    page,
    size,
  };
};

const crear = async ({ id_equipo, tema, fecha }) => {
  const { data: equipo } = await supabase
    .from('equipos')
    .select('id_equipo')
    .eq('id_equipo', id_equipo)
    .maybeSingle();

  if (!equipo) throw new AppError(400, `El equipo con id ${id_equipo} no existe`);

  // fecha viene como YYYY-MM-DDTHH:MM desde datetime-local; la columna es date → tomar solo la parte de fecha
  const fechaNorm = fecha ? fecha.slice(0, 10) : undefined;

  const { data, error } = await supabase
    .from('exposiciones')
    .insert({ id_equipo, tema, fecha: fechaNorm, estado: 'pendiente' })
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al crear exposicion');

  return data;
};

// FIX: 403 en lugar de 409 cuando el estado no permite la operacion
const actualizar = async (id, { id_equipo, tema, fecha }) => {
  const exposicion = await obtener(id);

  if (exposicion.estado !== 'pendiente') {
    throw new AppError(403, 'Solo se pueden modificar exposiciones en estado pendiente');
  }

  const { data: equipo } = await supabase
    .from('equipos')
    .select('id_equipo')
    .eq('id_equipo', id_equipo)
    .maybeSingle();

  if (!equipo) throw new AppError(400, `El equipo con id ${id_equipo} no existe`);

  const fechaNorm = fecha ? fecha.slice(0, 10) : undefined;

  const { data, error } = await supabase
    .from('exposiciones')
    .update({ id_equipo, tema, fecha: fechaNorm })
    .eq('id_exposicion', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al actualizar exposicion');

  return data;
};

// FIX: 403 en lugar de 409 cuando el estado no permite la operacion
const eliminar = async (id) => {
  const exposicion = await obtener(id);

  if (exposicion.estado !== 'pendiente') {
    throw new AppError(403, 'Solo se pueden eliminar exposiciones en estado pendiente');
  }

  const { error } = await supabase
    .from('exposiciones')
    .delete()
    .eq('id_exposicion', id);

  if (error) throw new AppError(500, 'Error al eliminar exposicion');
};

const habilitar = async (id, minutos_ventana) => {
  const exposicion = await obtener(id);

  if (exposicion.estado !== 'pendiente') {
    throw new AppError(403, 'Solo se pueden habilitar exposiciones en estado pendiente');
  }

  const { data: equipo } = await supabase
    .from('equipos')
    .select('id_grupo')
    .eq('id_equipo', exposicion.id_equipo)
    .maybeSingle();

  const { data: alumnos, error: alumnosError } = await supabase
    .from('alumnos')
    .select('id_alumno, id_equipo')
    .eq('id_grupo', equipo.id_grupo);

  if (alumnosError) throw new AppError(500, 'Error al obtener alumnos');

  // Excluir integrantes del equipo expositor (RN08)
  const alumnosHabilitados = alumnos.filter(
    a => a.id_equipo !== exposicion.id_equipo
  );

  const fecha_apertura = new Date();
  const fecha_cierre = new Date(fecha_apertura.getTime() + minutos_ventana * 60000);

  const permisos = alumnosHabilitados.map(a => ({
    id_alumno: a.id_alumno,
    id_exposicion: id,
    habilitado: true,
    evaluado: false,
    fecha_apertura,
    fecha_cierre,
  }));

  const { error: permisosError } = await supabase
    .from('permisos_evaluacion')
    .insert(permisos);

  if (permisosError) throw new AppError(500, 'Error al generar permisos');

  const { data, error } = await supabase
    .from('exposiciones')
    .update({ estado: 'activa', minutos_ventana })
    .eq('id_exposicion', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al habilitar exposicion');

  return data;
};

const cerrar = async (id, { metodo, password_confirmacion }, user) => {
  await obtener(id);

  if (metodo === 'password') {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('password_hash')
      .eq('id_usuario', user.id_usuario)
      .maybeSingle();

    const passwordValida = await bcrypt.compare(
      password_confirmacion || '',
      usuario.password_hash
    );

    if (!passwordValida) throw new AppError(403, 'Password de confirmacion incorrecto');
  }

  const { data, error } = await supabase
    .from('exposiciones')
    .update({ estado: 'cerrada' })
    .eq('id_exposicion', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al cerrar exposicion');

  return data;
};

module.exports = { listar, obtener, crear, actualizar, eliminar, habilitar, cerrar };
