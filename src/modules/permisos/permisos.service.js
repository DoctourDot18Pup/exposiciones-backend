const supabase = require('../../config/supabase');

const { AppError } = require('../../middlewares/errorHandler.middleware');

const listarPorExposicion = async (id_exposicion) => {
  const { data: exposicion } = await supabase
    .from('exposiciones')
    .select('id_exposicion')
    .eq('id_exposicion', id_exposicion)
    .maybeSingle();

  if (!exposicion) {
    throw new AppError(404, 'El recurso solicitado no existe');
  }

  const { data, error } = await supabase
    .from('permisos_evaluacion')
    .select('*')
    .eq('id_exposicion', id_exposicion);

  if (error) {
    throw new AppError(500, 'Error al obtener permisos');
  }

  return data;
};

const obtenerPermiso = async (id) => {
  const { data, error } = await supabase
    .from('permisos_evaluacion')
    .select('*')
    .eq('id_permiso', id)
    .maybeSingle();

  if (error) {
    throw new AppError(500, 'Error al obtener permiso');
  }

  if (!data) {
    throw new AppError(404, 'El recurso solicitado no existe');
  }

  return data;
};

const reabrir = async (id, minutos_ventana) => {
  await obtenerPermiso(id);

  const fecha_apertura = new Date();

  const fecha_cierre = new Date(
    fecha_apertura.getTime() + minutos_ventana * 60000
  );

  const { data, error } = await supabase
    .from('permisos_evaluacion')
    .update({
      habilitado: true,
      evaluado: false,
      fecha_apertura,
      fecha_cierre,
    })
    .eq('id_permiso', id)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Error al reabrir permiso');
  }

  return data;
};

module.exports = {
  listarPorExposicion,
  reabrir,
};