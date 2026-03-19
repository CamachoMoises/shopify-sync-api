import rateLimit from 'express-rate-limit';
import { logger } from '../config/logger.config';

// Rate limiter para endpoints generales
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '1000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '2', 10),
  message: {
    success: false,
    message: 'Demasiadas peticiones, por favor intente más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      path: req.path,
    });
    res.status(options.statusCode).json(options.message);
  },
});

// Rate limiter más estricto para operaciones de escritura
export const writeRateLimiter = rateLimit({
  windowMs: 1000, // 1 segundo
  max: 2, // Máximo 2 operaciones de escritura por segundo
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura, por favor intente más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn('Write rate limit excedido', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
});

// Rate limiter para operaciones masivas (bulk updates)
export const bulkRateLimiter = rateLimit({
  windowMs: 10000, // 10 segundos
  max: 1, // Máximo 1 operación masiva cada 10 segundos
  message: {
    success: false,
    message: 'Operación masiva en progreso, por favor espere',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn('Bulk rate limit excedido', {
      ip: req.ip,
      path: req.path,
    });
    res.status(options.statusCode).json(options.message);
  },
});