import { Request, Response, NextFunction } from 'express';
import { IProductService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Productos - Maneja HTTP requests (SRP)
export class ProductController {
  constructor(private readonly productService: IProductService) { }

  getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const first = Number(req.query.first) || 50;
      const after = typeof req.query.after === 'string' ? req.query.after : undefined;

      console.log('GET /products - Obteniendo lista de productos', { first, after });

      const page = await this.productService.getProductsPage(first, after);

      res.status(200).json({
        success: true,
        data: page.products,
        count: page.products.length,
        pageInfo: page.pageInfo,
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
      console.log(`GET /product/${product_id} - Obteniendo detalle de producto`);

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
      console.log('POST /product/create - Creando nuevo producto');

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
      console.log(`PUT /product/update/${product_id} - Actualizando producto`);

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
      console.log(`PUT /product/delete/${product_id} - Desactivando producto`);

      await this.productService.deleteProduct(product_id);

      res.status(200).json({
        success: true,
        message: 'Producto desactivado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  updateVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('POST /product/variants - Actualizando variantes');

      await this.productService.updateVariant(req.body);

      res.status(200).json({
        success: true,
        message: 'Variantes actualizadas exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('DELETE /product/variants - Eliminando variantes');

      await this.productService.deleteVariant(req.body);

      res.status(200).json({
        success: true,
        message: 'Variantes eliminadas exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  editProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId, ...updateData } = req.body;
      console.log(`POST /product/edit - Editando producto ${productId}`);

      await this.productService.updateProduct(productId, updateData);

      res.status(200).json({
        success: true,
        message: 'Producto editado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.body;
      console.log(`POST /product/delete - Eliminando producto ${productId}`);

      await this.productService.deleteProduct(productId);

      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  updateVariantImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('POST /product/variants/images - Actualizando imágenes de variantes');

      await this.productService.updateVariantImages(req.body);

      res.status(200).json({
        success: true,
        message: 'Imágenes de variantes actualizadas exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  addVariants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('POST /product/variants/add - Agregando variantes');

      await this.productService.addVariants(req.body);

      res.status(201).json({
        success: true,
        message: 'Variantes agregadas exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };
}