import { Router } from 'express';
import { ImageController } from '../controllers';
import { validateRequest } from '../middleware/validation.middleware';
import { createImageSchema } from '../validators/product.validator';
import { apiRateLimiter, writeRateLimiter } from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de imágenes (DIP)
export const createImageRoutes = (imageController: ImageController): Router => {
  const router = Router();

  // GET /product/images/:product_id - Lista de imágenes de un producto
  router.get(
    '/:product_id',
    apiRateLimiter,
    imageController.getImagesByProductId
  );

  // POST /product/images/add/:product_id/:shopify_variant_id - Agregar imagen a variante
  router.post(
    '/add/:product_id/:shopify_variant_id',
    writeRateLimiter,
    validateRequest(createImageSchema),
    imageController.addImageToVariant
  );

  return router;
};