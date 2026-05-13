const permisosService = require('./permisos.service');
const { formatError } = require('../../middlewares/errorHandler.middleware');

const listarPorExposicion = async (req, res, next) => {
  try {
    const id_exposicion = parseInt(req.params.id_exposicion, 10);
    if (!id_exposicion || id_exposicion < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const permisos = await permisosService.listarPorExposicion(id_exposicion);
    return res.status(200).json(permisos);
  } catch (err) {
    next(err);
  }
};

const reabrir = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || id < 1) {
      return res.status(400).json(formatError(400, 'ID invalido', req.originalUrl));
    }
    const permiso = await permisosService.reabrir(id);
    return res.status(200).json(permiso);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listarPorExposicion,
  reabrir,
};