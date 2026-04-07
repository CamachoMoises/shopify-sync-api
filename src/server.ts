import { createApp } from './app';
import { logger } from './config/logger.config';

const PORT = process.env.PORT || 3000;

const startServer = (): void => {
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    console.log(`📚 Documentación de la API:`);
    console.log(`   - Health Check: http://localhost:${PORT}/health`);
    console.log(`   - Products: http://localhost:${PORT}/products`);
    console.log(`   - Orders: http://localhost:${PORT}/orders`);
    console.log(`   - Locations: http://localhost:${PORT}/locations`);
  });
};

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', { reason });
  process.exit(1);
});

startServer();