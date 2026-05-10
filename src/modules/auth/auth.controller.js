const { z } = require('zod');
const authService = require('./auth.service');
const { formatError } = require('../../middlewares/errorHandler.middleware');

const loginSchema = z.object({
  username: z.string().min(5).max(100),
  password: z.string().min(6),
});

const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Datos invalidos';
      return res.status(400).json(formatError(400, message, req.originalUrl));
    }

    const result = await authService.login(parsed.data.username, parsed.data.password);

    if (!result) {
      return res.status(401).json(formatError(401, 'Credenciales incorrectas', req.originalUrl));
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
