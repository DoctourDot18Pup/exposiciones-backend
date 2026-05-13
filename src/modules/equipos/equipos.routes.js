const { Router } = require('express');
const { authenticate, requireRole } = require('../../middlewares/auth.middleware');
const { listar, obtener, crear, actualizar, eliminar, gestionarMiembros } = require('./equipos.controller');

const router = Router();

router.get('/', authenticate, listar);
router.post('/', authenticate, requireRole('docente'), crear);

router.get('/:id', authenticate, obtener);
router.put('/:id', authenticate, requireRole('docente'), actualizar);
router.delete('/:id', authenticate, requireRole('docente'), eliminar);
router.patch('/:id/miembros', authenticate, requireRole('docente'), gestionarMiembros);

module.exports = router;