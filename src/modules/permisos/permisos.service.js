const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const listarPorExposicion = async (id_exposicion) => {
  const { data: exposicion } = await supabase
    .from('exposiciones')
    .select('id_exposicion')
    .eq('id_exposicion', id_exposicion)
    .maybeSingle();

  if (!exposicion) throw new AppError(404, 'El recurso solicitado no existe');

  const { data, error } = await supabase
    .from('permisos_evaluacion')
    .select('*')
    .eq('id_exposicion', id_exposicion);

  if (error) throw new AppError(500, 'Error al obtener permisos');

  return data;
};

const obtenerPermiso = async (id) => {
  const { data, error } = await supabase
    .from('permisos_evaluacion')
    .select('*')
    .eq('id_permiso', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener permiso');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

// FIX (RN01): no permitir reabrir si el alumno ya evaluó — evita evaluaciones duplicadas
// fecha_cierre = null → sin restricción de tiempo (docente decide abrir indefinidamente)
const reabrir = async (id) => {
  const permiso = await obtenerPermiso(id);

  if (permiso.evaluado) {
    throw new AppError(409, 'El alumno ya ha evaluado esta exposicion y el permiso no puede reabrirse');
  }

  const { data, error } = await supabase
    .from('permisos_evaluacion')
    .update({ habilitado: true, evaluado: false, fecha_apertura: new Date().toISOString(), fecha_cierre: '2099-12-31T23:59:59.000Z' })
    .eq('id_permiso', id)
    .select()
    .single();

  if (error) {
    console.error('[reabrir] Supabase error:', error);
    throw new AppError(500, `Error al reabrir permiso: ${error.message}`);
  }

  return data;
};

module.exports = { listarPorExposicion, reabrir };
