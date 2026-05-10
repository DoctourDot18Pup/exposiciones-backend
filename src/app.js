const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const materiasRoutes = require('./modules/materias/materias.routes');
const { rubricasRouter, criteriosRouter } = require('./modules/rubricas/rubricas.routes');
const { errorHandler } = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/materias', materiasRoutes);
app.use('/api/v1/rubricas', rubricasRouter);
app.use('/api/v1/criterios', criteriosRouter);

app.use(errorHandler);

module.exports = app;
