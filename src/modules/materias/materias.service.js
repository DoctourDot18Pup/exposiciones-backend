const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const listar = async (page, size) => {
  const from = page * size;
  const to = from + size - 1;

  const { data, error, count } = await supabase
    .from('materias')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) throw new AppError(500, 'Error al obtener materias');

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
    .from('materias')
    .select('*')
    .eq('id_materia', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener materia');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const crear = async ({ clave_materia, nombre_materia }) => {
  const { data: existing } = await supabase
    .from('materias')
    .select('id_materia')
    .eq('clave_materia', clave_materia)
    .maybeSingle();

  if (existing) throw new AppError(409, `Ya existe una materia con la clave ${clave_materia}`);

  const { data, error } = await supabase
    .from('materias')
    .insert({ clave_materia, nombre_materia })
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al crear materia');

  return data;
};

const actualizar = async (id, { clave_materia, nombre_materia }) => {
  await obtener(id);

  const { data: duplicate } = await supabase
    .from('materias')
    .select('id_materia')
    .eq('clave_materia', clave_materia)
    .neq('id_materia', id)
    .maybeSingle();

  if (duplicate) throw new AppError(409, `Ya existe una materia con la clave ${clave_materia}`);

  const { data, error } = await supabase
    .from('materias')
    .update({ clave_materia, nombre_materia })
    .eq('id_materia', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al actualizar materia');

  return data;
};

const eliminar = async (id) => {
  await obtener(id);

  const { error } = await supabase
    .from('materias')
    .delete()
    .eq('id_materia', id);

  if (error) throw new AppError(500, 'Error al eliminar materia');
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
