import { Request, Response, NextFunction } from 'express';
import { IProductService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Productos - Maneja HTTP requests (SRP)
export class ProductController {
  constructor(private readonly productService: IProductService) {}

  getAllProducts = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('GET /products - Obteniendo lista de productos');
      
      const products = await this.productService.getAllProducts();
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { product_id } = req.params;
      logger.info(`GET /product/${product_id} - Obteniendo detalle de producto`);

      const product = await this.productService.getProductById(product_id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('POST /product/create - Creando nuevo producto');

      const shopifyId = await this.productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: {
          shopify_id: shopifyId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { product_id } = req.params;
      logger.info(`PUT /product/update/${product_id} - Actualizando producto`);

      await this.productService.updateProduct(product_id, req.body);

      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { product_id } = req.params;
      logger.info(`PUT /product/delete/${product_id} - Desactivando producto`);

      await this.productService.deleteProduct(product_id);

      res.status(200).json({
        success: true,
        message: 'Producto desactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}