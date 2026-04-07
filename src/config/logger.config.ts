import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'shopify-sync-api',
  },
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
        : undefined,
    }),
  ],
});

// Stream para Morgan (HTTP logging)
export const loggerStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};