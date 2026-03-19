import { Router } from 'express';
import { ProductController } from '../controllers';
import { validateRequest } from '../middleware/validation.middleware';
import { 
  createProductSchema, 
  updateProductSchema 
} from '../validators/product.validator';
import { apiRateLimiter, writeRateLimiter } from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de productos (DIP)
export const createProductRoutes = (
  productController: ProductController
): Router => {
  const router = Router();

  // GET /products - Lista de productos
  router.get(
    '/',
    apiRateLimiter,
    productController.getAllProducts
  );

  // GET /product/:product_id - Detalles de producto
  router.get(
    '/:product_id',
    apiRateLimiter,
    productController.getProductById
  );

  // POST /product/create - Crear producto
  router.post(
    '/create',
    writeRateLimiter,
    validateRequest(createProductSchema),
    productController.createProduct
  );

  // PUT /product/update/:product_id - Actualizar producto
  router.put(
    '/update/:product_id',
    writeRateLimiter,
    validateRequest(updateProductSchema),
    productController.updateProduct
  );

  // PUT /product/delete/:product_id - Desactivar producto
  router.put(
    '/delete/:product_id',
    writeRateLimiter,
    productController.deleteProduct
  );

  return router;
};