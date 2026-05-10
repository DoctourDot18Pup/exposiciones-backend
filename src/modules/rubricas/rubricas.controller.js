const { z } = require('zod');
const service = require('./rubricas.service');
const { formatError } = require('../../middlewares/errorHandler.middleware');

const rubricaInputSchema = z.object({
  id_materia: z.number().int().min(1),
  nombre: z.string().min(3).max(100),
});

const criterioInputSchema = z.object({
  descripcion: z.string().min(3).max(200),
  ponderacion: z.number().min(0.1).max(100.0),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

// ── RUBRICAS ──────────────────────────────────────────────────────────────────

const listar = async (req, res, next) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Parametros invalidos', req.originalUrl));
    }
    const result = await service.listar(parsed.data.page, parsed.data.size);
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
    const rubrica = await service.obtener(id);
    return res.status(200).json(rubrica);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const parsed = rubricaInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const rubrica = await service.crear(parsed.data);
    return res.status(201).json(rubrica);
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
    const parsed = rubricaInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const rubrica = await service.actualizar(id, parsed.data);
    return res.status(200).json(rubrica);
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
    await service.eliminar(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ── CRITERIOS ─────────────────────────────────────────────────────────────────

const listarCriterios = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const criterios = await service.listarCriterios(id);
    return res.status(200).json(criterios);
  } catch (err) {
    next(err);
  }
};

const agregarCriterio = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const parsed = criterioInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const criterio = await service.agregarCriterio(id, parsed.data);
    return res.status(201).json(criterio);
  } catch (err) {
    next(err);
  }
};

const actualizarCriterio = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const parsed = criterioInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const criterio = await service.actualizarCriterio(id, parsed.data);
    return res.status(200).json(criterio);
  } catch (err) {
    next(err);
  }
};

const eliminarCriterio = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    await service.eliminarCriterio(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar, obtener, crear, actualizar, eliminar,
  listarCriterios, agregarCriterio, actualizarCriterio, eliminarCriterio,
};
