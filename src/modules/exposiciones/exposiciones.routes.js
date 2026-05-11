const { Router } = require('express');
const { authenticate, requireRole } = require('../../middlewares/auth.middleware');

const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  habilitar,
  cerrar,
} = require('./exposiciones.controller');

const router = Router();

router.get('/', authenticate, listar);
router.post('/', authenticate, requireRole('docente'), crear);

router.get('/:id', authenticate, obtener);
router.put('/:id', authenticate, requireRole('docente'), actualizar);
router.delete('/:id', authenticate, requireRole('docente'), eliminar);

router.patch('/:id/habilitar', authenticate, requireRole('docente'), habilitar);
router.patch('/:id/cerrar', authenticate, requireRole('docente'), cerrar);

module.exports = router;