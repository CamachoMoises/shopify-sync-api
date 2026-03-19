import { Router } from 'express';
import { OrderController } from '../controllers';
import { apiRateLimiter } from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de órdenes (DIP)
export const createOrderRoutes = (orderController: OrderController): Router => {
  const router = Router();

  // GET /orders - Sincronizar órdenes desde Shopify
  router.get(
    '/',
    apiRateLimiter,
    orderController.getAllOrders
  );

  // GET /order/products/:order_id - Detalles de productos en orden
  router.get(
    '/products/:order_id',
    apiRateLimiter,
    orderController.getOrderProducts
  );

  return router;
};