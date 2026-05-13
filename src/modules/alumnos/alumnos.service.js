const bcrypt = require('bcrypt');
const supabase = require('../../config/supabase');
const { AppError } = require('../../middlewares/errorHandler.middleware');

const normalizar = str =>
  str.toLowerCase()
     .normalize('NFD')
     .replace(/[̀-ͯ]/g, '')   // strip diacritics: á→a, é→e, ñ→n, ü→u…
     .replace(/[^a-z0-9]/g, '');        // keep only ascii alphanumeric

const generarCredenciales = (apellido, matricula) => {
  const prefijo = normalizar(apellido).slice(0, 4);
  const sufijo  = matricula.slice(-4);
  return {
    username: `${matricula}@${process.env.INSTITUTIONAL_DOMAIN}`,
    password_temporal: prefijo + sufijo,
  };
};

const listar = async (page, size) => {
  const from = page * size;
  const to = from + size - 1;

  const { data, error, count } = await supabase
    .from('alumnos')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) throw new AppError(500, 'Error al obtener alumnos');

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
    .from('alumnos')
    .select('*')
    .eq('id_alumno', id)
    .maybeSingle();

  if (error) throw new AppError(500, 'Error al obtener alumno');
  if (!data) throw new AppError(404, 'El recurso solicitado no existe');

  return data;
};

const crear = async ({ nombre, apellido, matricula, id_grupo }) => {
  const { data: grupo } = await supabase
    .from('grupos')
    .select('id_grupo')
    .eq('id_grupo', id_grupo)
    .maybeSingle();

  if (!grupo) throw new AppError(400, `El grupo con id ${id_grupo} no existe`);

  const { data: alumnoExistente } = await supabase
    .from('alumnos')
    .select('id_alumno')
    .eq('matricula', matricula)
    .maybeSingle();

  if (alumnoExistente) throw new AppError(409, `Ya existe un alumno con la matricula ${matricula}`);

  const { username, password_temporal } = generarCredenciales(apellido, matricula);

  const { data: usuarioExistente } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('username', username)
    .maybeSingle();

  if (usuarioExistente) throw new AppError(409, `Ya existe un usuario con el username ${username}`);

  const password_hash = await bcrypt.hash(password_temporal, 10);

  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .insert({ username, password_hash, rol: 'alumno' })
    .select('id_usuario')
    .single();

  if (userError) throw new AppError(500, 'Error al crear credenciales del alumno');

  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .insert({ id_usuario: usuario.id_usuario, id_grupo, nombre, apellido, matricula })
    .select()
    .single();

  if (alumnoError) {
    await supabase.from('usuarios').delete().eq('id_usuario', usuario.id_usuario);
    throw new AppError(500, 'Error al registrar alumno');
  }

  return { ...alumno, credenciales: { username, password_temporal } };
};

const actualizar = async (id, { nombre, apellido, matricula, id_grupo }) => {
  const alumnoActual = await obtener(id);

  const { data: grupo } = await supabase
    .from('grupos')
    .select('id_grupo')
    .eq('id_grupo', id_grupo)
    .maybeSingle();

  if (!grupo) throw new AppError(400, `El grupo con id ${id_grupo} no existe`);

  if (matricula !== alumnoActual.matricula) {
    const { data: duplicado } = await supabase
      .from('alumnos')
      .select('id_alumno')
      .eq('matricula', matricula)
      .maybeSingle();

    if (duplicado) throw new AppError(409, `Ya existe un alumno con la matricula ${matricula}`);

    const nuevoUsername = `${matricula}@${process.env.INSTITUTIONAL_DOMAIN}`;

    await supabase
      .from('usuarios')
      .update({ username: nuevoUsername })
      .eq('id_usuario', alumnoActual.id_usuario);
  }

  const { data, error } = await supabase
    .from('alumnos')
    .update({ nombre, apellido, matricula, id_grupo })
    .eq('id_alumno', id)
    .select()
    .single();

  if (error) throw new AppError(500, 'Error al actualizar alumno');

  return data;
};

const eliminar = async (id) => {
  const alumno = await obtener(id);

  const { error: alumnoError } = await supabase
    .from('alumnos')
    .delete()
    .eq('id_alumno', id);

  if (alumnoError) throw new AppError(500, 'Error al eliminar alumno');

  await supabase.from('usuarios').delete().eq('id_usuario', alumno.id_usuario);
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
