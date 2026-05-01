import { Request, Response, NextFunction } from 'express';
import { IOrderService } from '../types';

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

  getAllOrdersSimple = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('GET /orders/simple - Obteniendo lista simple de órdenes');

      const orders = await this.orderService.getAllOrdersSimple();

      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orderId = req.query.order_id as string;
      console.log(`GET /order?order_id=${orderId} - Obteniendo detalles de la orden`);

      if (!orderId) {
        res.status(400).json({ success: false, message: 'El parámetro order_id es requerido' });
        return;
      }

      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({ success: false, message: 'Orden no encontrada' });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };
}