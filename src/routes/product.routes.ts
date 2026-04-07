import { Router } from 'express';
import { ProductController } from '../controllers';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  bulkUpdateVariantsSchema,
  bulkDeleteVariantsSchema,
  editProductSchema,
  deleteProductSchema,
  updateVariantImagesSchema,
  addVariantsSchema
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

  // GET /products/simple - Lista simple de productos
  router.get(
    '/simple',
    apiRateLimiter,
    productController.getAllProductsSimple
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

  // POST /product/variants - Actualizar variantes
  router.post(
    '/variants',
    writeRateLimiter,
    validateRequest(bulkUpdateVariantsSchema),
    productController.updateVariant
  );

  // DELETE /product/variants - Eliminar variantes
  router.delete(
    '/variants',
    writeRateLimiter,
    validateRequest(bulkDeleteVariantsSchema),
    productController.deleteVariant
  );

  // POST /product/edit - Editar producto
  router.post(
    '/edit',
    writeRateLimiter,
    validateRequest(editProductSchema),
    productController.editProduct
  );

  // POST /product/delete - Eliminar producto
  router.post(
    '/delete',
    writeRateLimiter,
    validateRequest(deleteProductSchema),
    productController.deleteProductById
  );

  // POST /product/variants/images - Actualizar imágenes de variantes
  router.post(
    '/variants/images',
    writeRateLimiter,
    validateRequest(updateVariantImagesSchema),
    productController.updateVariantImages
  );

  // POST /product/variants/add - Agregar variantes
  router.post(
    '/variants/add',
    writeRateLimiter,
    validateRequest(addVariantsSchema),
    productController.addVariants
  );

  return router;
};