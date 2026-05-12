const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const materiasRoutes = require('./modules/materias/materias.routes');
const { rubricasRouter, criteriosRouter } = require('./modules/rubricas/rubricas.routes');
const gruposRoutes = require('./modules/grupos/grupos.routes');
const alumnosRoutes = require('./modules/alumnos/alumnos.routes');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const equiposRoutes = require('./modules/equipos/equipos.routes');
const exposicionesRoutes = require('./modules/exposiciones/exposiciones.routes');
const permisosRoutes = require('./modules/permisos/permisos.routes');
const evaluacionesRoutes = require('./modules/evaluaciones/evaluaciones.routes');

const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/materias', materiasRoutes);
app.use('/api/v1/rubricas', rubricasRouter);
app.use('/api/v1/criterios', criteriosRouter);
app.use('/api/v1/grupos', gruposRoutes);
app.use('/api/v1/alumnos', alumnosRoutes);
app.use('/api/v1/equipos', equiposRoutes);
app.use('/api/v1/exposiciones', exposicionesRoutes);
app.use('/api/v1/permisos', permisosRoutes);
app.use('/api/v1/evaluaciones', evaluacionesRoutes);

app.use(errorHandler);

module.exports = app;
