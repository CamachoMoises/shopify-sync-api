import { Router } from 'express';
import { PublicationController } from '../controllers';
import { apiRateLimiter } from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de publicaciones (DIP)
export const createPublicationRoutes = (
    publicationController: PublicationController
): Router => {
    const router = Router();

    // GET /publications - Lista de publicaciones
    router.get(
        '/',
        apiRateLimiter,
        publicationController.getAllPublications
    );

    return router;
};
