import { Router } from 'express';
import { OrderController } from '../controllers';
import { apiRateLimiter } from '../middleware/rate-limit.middleware';

// Factory function para crear rutas de órdenes (DIP)
export const createOrderRoutes = (orderController: OrderController): Router => {
  const router = Router();

  // GET /orders - Sincronizar órdenes desde Shopify (solo mounted en /orders)
  router.get(
    '/',
    apiRateLimiter,
    orderController.getAllOrders
  );

  // GET /orders/simple - Lista simple de órdenes
  router.get(
    '/simple',
    apiRateLimiter,
    orderController.getAllOrdersSimple
  );

// GET /orders/products/:order_id - Detalles de productos en orden
  router.get(
    '/products/:order_id',
    apiRateLimiter,
    orderController.getOrderProducts
  );

  // GET /orders/simple - Lista simple de órdenes
  router.get(
    '/simple',
    apiRateLimiter,
    orderController.getAllOrdersSimple
  );

  return router;
};