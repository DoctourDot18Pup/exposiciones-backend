const { z } = require('zod');

const permisosService = require('./permisos.service');

const { formatError } = require('../../middlewares/errorHandler.middleware');

const reabrirInputSchema = z.object({
  minutos_ventana: z.literal(10).or(z.literal(15)),
});

const listarPorExposicion = async (req, res, next) => {
  try {
    const id_exposicion = parseInt(req.params.id_exposicion, 10);

    if (!id_exposicion || id_exposicion < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    const permisos = await permisosService.listarPorExposicion(
      id_exposicion
    );

    return res.status(200).json(permisos);
  } catch (err) {
    next(err);
  }
};

const reabrir = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id || id < 1) {
      return res.status(400).json(
        formatError(400, 'ID invalido', req.originalUrl)
      );
    }

    const parsed = reabrirInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(
        formatError(
          400,
          parsed.error.issues[0]?.message || 'Datos invalidos',
          req.originalUrl
        )
      );
    }

    const permiso = await permisosService.reabrir(
      id,
      parsed.data.minutos_ventana
    );

    return res.status(200).json(permiso);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarPorExposicion,
  reabrir,
};