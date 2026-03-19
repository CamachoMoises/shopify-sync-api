import { Request, Response, NextFunction } from 'express';
import { IOrderService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Órdenes - Maneja HTTP requests (SRP)
export class OrderController {
  constructor(private readonly orderService: IOrderService) {}

  getAllOrders = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('GET /orders - Sincronizando órdenes desde Shopify');

      const orders = await this.orderService.getAllOrders();

      res.status(200).json({
        success: true,
        message: 'Órdenes sincronizadas exitosamente',
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { order_id } = req.params;
      logger.info(
        `GET /order/products/${order_id} - Obteniendo productos de la orden`
      );

      const lineItems = await this.orderService.getOrderProducts(order_id);

      res.status(200).json({
        success: true,
        data: lineItems,
        count: lineItems.length,
      });
    } catch (error) {
      next(error);
    }
  };
}