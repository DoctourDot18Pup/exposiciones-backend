const { z } = require('zod');
const alumnosService = require('./alumnos.service');
const { formatError } = require('../../middlewares/errorHandler.middleware');

const alumnoInputSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellido: z.string().min(2).max(100),
  matricula: z.string().min(3).max(20),
  id_grupo: z.number().int().min(1),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

const listar = async (req, res, next) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Parametros invalidos', req.originalUrl));
    }
    const result = await alumnosService.listar(parsed.data.page, parsed.data.size);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const alumno = await alumnosService.obtener(id);
    return res.status(200).json(alumno);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const parsed = alumnoInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const alumno = await alumnosService.crear(parsed.data);
    return res.status(201).json(alumno);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const parsed = alumnoInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const alumno = await alumnosService.actualizar(id, parsed.data);
    return res.status(200).json(alumno);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    await alumnosService.eliminar(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
