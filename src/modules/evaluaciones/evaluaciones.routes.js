const { Router } = require('express');
const { authenticate, requireRole } = require('../../middlewares/auth.middleware');
const { registrar, obtener, consultarResultados } = require('./evaluaciones.controller');

const router = Router();

router.post('/', authenticate, requireRole('alumno'), registrar);

// /exposicion/:id_exposicion debe ir antes que /:id para evitar captura incorrecta del param
router.get('/exposicion/:id_exposicion', authenticate, requireRole('docente'), consultarResultados);

router.get('/:id', authenticate, obtener);

module.exports = router;
