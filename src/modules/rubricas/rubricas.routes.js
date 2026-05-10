const { Router } = require('express');
const { authenticate, requireRole } = require('../../middlewares/auth.middleware');
const ctrl = require('./rubricas.controller');

const rubricasRouter = Router();
const criteriosRouter = Router();

// ── /api/v1/rubricas ──────────────────────────────────────────────────────────
rubricasRouter.get('/', authenticate, ctrl.listar);
rubricasRouter.post('/', authenticate, requireRole('docente'), ctrl.crear);

rubricasRouter.get('/:id', authenticate, ctrl.obtener);
rubricasRouter.put('/:id', authenticate, requireRole('docente'), ctrl.actualizar);
rubricasRouter.delete('/:id', authenticate, requireRole('docente'), ctrl.eliminar);

rubricasRouter.get('/:id/criterios', authenticate, ctrl.listarCriterios);
rubricasRouter.post('/:id/criterios', authenticate, requireRole('docente'), ctrl.agregarCriterio);

// ── /api/v1/criterios ─────────────────────────────────────────────────────────
criteriosRouter.put('/:id', authenticate, requireRole('docente'), ctrl.actualizarCriterio);
criteriosRouter.delete('/:id', authenticate, requireRole('docente'), ctrl.eliminarCriterio);

module.exports = { rubricasRouter, criteriosRouter };
