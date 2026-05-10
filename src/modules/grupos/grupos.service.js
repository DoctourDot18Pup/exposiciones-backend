const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const listar = async (page, size) => {
  const from = page * size;
  const to = from + size - 1;

  const { data, error, count } = await supabase
    .from('grupos')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) throw new AppError(500, 'Error al obtener grupos');

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
    .from('grupos')
    .select('*')
    .eq('id_grupo', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener grupo');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const crear = async ({ id_materia, nombre_grupo }) => {
  const { data: materia } = await supabase
    .from('materias')
    .select('id_materia')
    .eq('id_materia', id_materia)
    .maybeSingle();

  if (!materia) throw new AppError(400, `La materia con id ${id_materia} no existe`);

  const { data, error } = await supabase
    .from('grupos')
    .insert({ id_materia, nombre_grupo })
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al crear grupo');

  return data;
};

const actualizar = async (id, { id_materia, nombre_grupo }) => {
  await obtener(id);

  const { data: materia } = await supabase
    .from('materias')
    .select('id_materia')
    .eq('id_materia', id_materia)
    .maybeSingle();

  if (!materia) throw new AppError(400, `La materia con id ${id_materia} no existe`);

  const { data, error } = await supabase
    .from('grupos')
    .update({ id_materia, nombre_grupo })
    .eq('id_grupo', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al actualizar grupo');

  return data;
};

const eliminar = async (id) => {
  await obtener(id);

  const { error } = await supabase
    .from('grupos')
    .delete()
    .eq('id_grupo', id);

  if (error) throw new AppError(500, 'Error al eliminar grupo');
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
