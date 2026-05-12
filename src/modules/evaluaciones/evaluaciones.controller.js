const { z } = require('zod');
const evaluacionesService = require('./evaluaciones.service');
const { formatError } = require('../../middlewares/errorHandler.middleware');

const evaluacionInputSchema = z.object({
  id_exposicion: z.number().int().min(1),
  detalles: z.array(
    z.object({
      id_criterio: z.number().int().min(1),
      calificacion: z.number(),
    })
  ).min(1),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

const registrar = async (req, res, next) => {
  try {
    const parsed = evaluacionInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatError(400, parsed.error.issues[0]?.message || 'Datos invalidos', req.originalUrl));
    }
    const evaluacion = await evaluacionesService.registrar(req.user.id_usuario, parsed.data);
    return res.status(201).json(evaluacion);
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
    const evaluacion = await evaluacionesService.obtener(id);
    return res.status(200).json(evaluacion);
  } catch (err) {
    next(err);
  }
};

const consultarResultados = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id_exposicion, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const result = await evaluacionesService.consultarResultados(id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { registrar, obtener, consultarResultados };
