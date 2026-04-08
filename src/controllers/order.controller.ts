import { Request, Response, NextFunction } from 'express';
import { IOrderService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Órdenes - Maneja HTTP requests (SRP)
export class OrderController {
  constructor(private readonly orderService: IOrderService) { }

  getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const first = Number(req.query.first) || 50;
      const after = typeof req.query.after === 'string' ? req.query.after : undefined;

      console.log('GET /orders - Obteniendo lista de órdenes', { first, after });

      const page = await this.orderService.getOrdersPage(first, after);

      res.status(200).json({
        success: true,
        data: page.orders,
        count: page.orders.length,
        pageInfo: page.pageInfo,
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
      console.log(
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