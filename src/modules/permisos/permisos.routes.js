const { Router } = require('express');

const { authenticate, requireRole } = require('../../middlewares/auth.middleware');

const {
  listarPorExposicion,
  reabrir,
} = require('./permisos.controller');

const router = Router();

router.get(
  '/exposicion/:id_exposicion',
  authenticate,
  requireRole('docente'),
  listarPorExposicion
);

router.patch(
  '/:id/reabrir',
  authenticate,
  requireRole('docente'),
  reabrir
);

module.exports = router;