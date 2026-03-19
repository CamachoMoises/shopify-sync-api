import { Router } from 'express';
import { InventoryController } from '../controllers';
import { validateRequest } from '../middleware/validation.middleware';
import { bulkInventoryUpdateSchema } from '../validators/product.validator';
import { apiRateLimiter, writeRateLimiter, bulkRateLimiter } from '../middleware/rate-limit.middleware';

export const createInventoryRoutes = (
    inventoryController: InventoryController
): Router => {
    const router = Router();

    // GET /inventory/products - Listado de productos con inventario
    router.get(
        '/products',
        apiRateLimiter,
        inventoryController.listProductsInventory
    );

    // GET /inventory/products/:product_id - Detalles de inventario de un producto
    router.get(
        '/products/:product_id',
        apiRateLimiter,
        inventoryController.showProductInventory
    );

    // PUT /inventory/products/:product_id - Actualizar inventario de un producto (variantes)
    router.put(
        '/products/:product_id',
        writeRateLimiter,
        inventoryController.updateProductInventory
    );

    // GET /inventory/variants/:product_id - Listado de inventario de variantes
    router.get(
        '/variants/:product_id',
        apiRateLimiter,
        inventoryController.listVariantsInventory
    );

    // GET /inventory/variant/:variant_id - Detalle de inventario de variante
    router.get(
        '/variant/:variant_id',
        apiRateLimiter,
        inventoryController.showVariantInventory
    );

    // PUT /inventory/variant/:variant_id - Actualizar inventario de variante individual
    router.put(
        '/variant/:variant_id',
        writeRateLimiter,
        inventoryController.updateVariantInventory
    );

    // POST /inventory/variants/bulk-update - Actualizar inventario masivo de variantes
    router.post(
        '/variants/bulk-update',
        bulkRateLimiter,
        validateRequest(bulkInventoryUpdateSchema),
        inventoryController.bulkUpdateVariantsInventory
    );

    return router;
};