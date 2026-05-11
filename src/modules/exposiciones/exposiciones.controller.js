const { z } = require('zod');

const exposicionesService = require('./exposiciones.service');
const { formatError } = require('../../middlewares/errorHandler.middleware');

const exposicionInputSchema = z.object({
  id_equipo: z.number().int().min(1),
  tema: z.string().min(3).max(200),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const habilitarInputSchema = z.object({
  minutos_ventana: z.literal(10).or(z.literal(15)),
});

const cierreInputSchema = z.object({
  metodo: z.enum(['password', 'captcha']),
  password_confirmacion: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

const listar = async (req, res, next) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json(
        formatError(
          400,
          parsed.error.issues[0]?.message || 'Parametros invalidos',
          req.originalUrl
        )
      );
    }

    const result = await exposicionesService.listar(
      req.user,
      parsed.data.page,
      parsed.data.size
    );

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id || id < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    const exposicion = await exposicionesService.obtener(id);

    return res.status(200).json(exposicion);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const parsed = exposicionInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(
        formatError(
          400,
          parsed.error.issues[0]?.message || 'Datos invalidos',
          req.originalUrl
        )
      );
    }

    const exposicion = await exposicionesService.crear(parsed.data);

    return res.status(201).json(exposicion);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id || id < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    const parsed = exposicionInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(
        formatError(
          400,
          parsed.error.issues[0]?.message || 'Datos invalidos',
          req.originalUrl
        )
      );
    }

    const exposicion = await exposicionesService.actualizar(id, parsed.data);

    return res.status(200).json(exposicion);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id || id < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    await exposicionesService.eliminar(id);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const habilitar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id || id < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    const parsed = habilitarInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(
        formatError(
          400,
          parsed.error.issues[0]?.message || 'Datos invalidos',
          req.originalUrl
        )
      );
    }

    const result = await exposicionesService.habilitar(
      id,
      parsed.data.minutos_ventana
    );

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const cerrar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id || id < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    const parsed = cierreInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(
        formatError(
          400,
          parsed.error.issues[0]?.message || 'Datos invalidos',
          req.originalUrl
        )
      );
    }

    const result = await exposicionesService.cerrar(
      id,
      parsed.data,
      req.user
    );

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  habilitar,
  cerrar,
};