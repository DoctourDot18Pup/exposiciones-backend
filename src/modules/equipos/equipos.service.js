const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const listar = async (page, size) => {
  const from = page * size;
  const to = from + size - 1;

  const { data, error, count } = await supabase
    .from('equipos')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) {
    throw new AppError(500, 'Error al obtener equipos');
  }

  return {
    content: data,
    totalElements: count,
    totalPages: count === 0 ? 0 : Math.ceil(count / size),
    page,
    size,
  };
};

const obtener = async (id) => {
  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('id_equipo', id)
    .maybeSingle();

  if (error) {
    throw new AppError(500, 'Error al obtener equipo');
  }

  if (!data) {
    throw new AppError(404, 'El recurso solicitado no existe');
  }

  return data;
};

const crear = async ({ id_grupo, nombre_equipo }) => {
  const { data: grupo } = await supabase
    .from('grupos')
    .select('id_grupo')
    .eq('id_grupo', id_grupo)
    .maybeSingle();

  if (!grupo) {
    throw new AppError(400, `El grupo con id ${id_grupo} no existe`);
  }

  const { data, error } = await supabase
    .from('equipos')
    .insert({
      id_grupo,
      nombre_equipo,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Error al crear equipo');
  }

  return data;
};

const actualizar = async (id, { id_grupo, nombre_equipo }) => {
  await obtener(id);

  const { data: grupo } = await supabase
    .from('grupos')
    .select('id_grupo')
    .eq('id_grupo', id_grupo)
    .maybeSingle();

  if (!grupo) {
    throw new AppError(400, `El grupo con id ${id_grupo} no existe`);
  }

  const { data, error } = await supabase
    .from('equipos')
    .update({
      id_grupo,
      nombre_equipo,
    })
    .eq('id_equipo', id)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Error al actualizar equipo');
  }

  return data;
};

const eliminar = async (id) => {
  await obtener(id);

  const { error } = await supabase
    .from('equipos')
    .delete()
    .eq('id_equipo', id);

  if (error) {
    throw new AppError(500, 'Error al eliminar equipo');
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};