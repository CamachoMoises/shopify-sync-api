import { Router } from 'express';
import { VariantController } from '../controllers';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createVariantSchema,
  updateVariantSchema,
} from '../validators/product.validator';
import {
  apiRateLimiter,
  writeRateLimiter,
} from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de variantes (DIP)
export const createVariantRoutes = (
  variantController: VariantController
): Router => {
  const router = Router();

  // GET /product/variants/:product_id - Lista de variantes de un producto
  router.get(
    '/:product_id',
    apiRateLimiter,
    variantController.getVariantsByProductId
  );

  // POST /product/variant/create - Crear variante (con productId en body)
  router.post(
    '/create',
    writeRateLimiter,
    validateRequest(createVariantSchema),
    variantController.createVariant
  );

  // POST /product/variant/create/:producto_id - Crear variante para producto específico
  router.post(
    '/create/:producto_id',
    writeRateLimiter,
    validateRequest(createVariantSchema),
    variantController.createVariantForProduct
  );

  // PUT /product/variant/update/:shopify_variant_id - Actualizar variante
  router.put(
    '/update/:shopify_variant_id',
    writeRateLimiter,
    validateRequest(updateVariantSchema),
    variantController.updateVariant
  );

  // PUT /product/variant/delete/:shopify_variant_id - Desactivar variante
  router.put(
    '/delete/:shopify_variant_id',
    writeRateLimiter,
    variantController.deleteVariant
  );

  return router;
};