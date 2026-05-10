const jwt = require('jsonwebtoken');
const { formatError } = require('./errorHandler.middleware');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(formatError(401, 'Token invalido o expirado', req.originalUrl));
  }

  const token = authHeader.slice(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json(formatError(401, 'Token invalido o expirado', req.originalUrl));
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.rol !== role) {
    return res.status(403).json(formatError(403, 'No tiene permisos para realizar esta operacion', req.originalUrl));
  }
  next();
};

module.exports = { authenticate, requireRole };
