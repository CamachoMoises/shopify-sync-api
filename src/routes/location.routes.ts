import { Router } from 'express';
import { LocationController } from '../controllers';
import { apiRateLimiter } from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de locaciones (DIP)
export const createLocationRoutes = (
  locationController: LocationController
): Router => {
  const router = Router();

  // GET /locations - Lista de locaciones
  router.get(
    '/',
    apiRateLimiter,
    locationController.getAllLocations
  );

  return router;
};