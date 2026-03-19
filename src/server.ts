import { createApp } from './app';
import { logger } from './config/logger.config';

const PORT = process.env.PORT || 3000;

const startServer = (): void => {
  const app = createApp();

  app.listen(PORT, () => {
    logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
    logger.info(`📚 Documentación de la API:`);
    logger.info(`   - Health Check: http://localhost:${PORT}/health`);
    logger.info(`   - Products: http://localhost:${PORT}/products`);
    logger.info(`   - Orders: http://localhost:${PORT}/orders`);
    logger.info(`   - Locations: http://localhost:${PORT}/locations`);
  });
};

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

startServer();