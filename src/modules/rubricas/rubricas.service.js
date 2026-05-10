const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

// ── RUBRICAS ──────────────────────────────────────────────────────────────────

const listar = async (page, size) => {
  const from = page * size;
  const to = from + size - 1;

  const { data, error, count } = await supabase
    .from('rubricas')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) throw new AppError(500, 'Error al obtener rubricas');

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
    .from('rubricas')
    .select('*')
    .eq('id_rubrica', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener rubrica');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const crear = async ({ id_materia, nombre }) => {
  const { data: materia } = await supabase
    .from('materias')
    .select('id_materia')
    .eq('id_materia', id_materia)
    .maybeSingle();

  if (!materia) throw new AppError(400, `La materia con id ${id_materia} no existe`);

  const { data, error } = await supabase
    .from('rubricas')
    .insert({ id_materia, nombre })
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al crear rubrica');

  return data;
};

const actualizar = async (id, { id_materia, nombre }) => {
  await obtener(id);

  const { data: materia } = await supabase
    .from('materias')
    .select('id_materia')
    .eq('id_materia', id_materia)
    .maybeSingle();

  if (!materia) throw new AppError(400, `La materia con id ${id_materia} no existe`);

  const { data, error } = await supabase
    .from('rubricas')
    .update({ id_materia, nombre })
    .eq('id_rubrica', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al actualizar rubrica');

  return data;
};

const eliminar = async (id) => {
  await obtener(id);

  const { error } = await supabase
    .from('rubricas')
    .delete()
    .eq('id_rubrica', id);

  if (error) throw new AppError(500, 'Error al eliminar rubrica');
};

// ── CRITERIOS ─────────────────────────────────────────────────────────────────

const listarCriterios = async (id_rubrica) => {
  await obtener(id_rubrica);

  const { data, error } = await supabase
    .from('criterios')
    .select('*')
    .eq('id_rubrica', id_rubrica);

  if (error) throw new AppError(500, 'Error al obtener criterios');

  return data;
};

const agregarCriterio = async (id_rubrica, { descripcion, ponderacion }) => {
  await obtener(id_rubrica);

  const { data, error } = await supabase
    .from('criterios')
    .insert({ id_rubrica, descripcion, ponderacion })
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al agregar criterio');

  return data;
};

const obtenerCriterio = async (id) => {
  const { data, error } = await supabase
    .from('criterios')
    .select('*')
    .eq('id_criterio', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener criterio');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const actualizarCriterio = async (id, { descripcion, ponderacion }) => {
  await obtenerCriterio(id);

  const { data, error } = await supabase
    .from('criterios')
    .update({ descripcion, ponderacion })
    .eq('id_criterio', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al actualizar criterio');

  return data;
};

const eliminarCriterio = async (id) => {
  await obtenerCriterio(id);

  const { error } = await supabase
    .from('criterios')
    .delete()
    .eq('id_criterio', id);

  if (error) throw new AppError(500, 'Error al eliminar criterio');
};

module.exports = {
  listar, obtener, crear, actualizar, eliminar,
  listarCriterios, agregarCriterio, actualizarCriterio, eliminarCriterio,
};
