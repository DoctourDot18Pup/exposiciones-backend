const STATUS_TEXTS = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

const formatError = (status, message, path) => ({
  timestamp: new Date().toISOString(),
  status,
  error: STATUS_TEXTS[status] || 'Error',
  message,
  path,
});

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json(formatError(status, message, req.originalUrl));
};

module.exports = { AppError, formatError, errorHandler };
