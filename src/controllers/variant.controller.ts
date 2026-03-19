import { Request, Response, NextFunction } from 'express';
import { IVariantService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Variantes - Maneja HTTP requests (SRP)
export class VariantController {
  constructor(private readonly variantService: IVariantService) {}

  getVariantsByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { product_id } = req.params;
      logger.info(
        `GET /product/variants/${product_id} - Obteniendo variantes del producto`
      );

      const variants = await this.variantService.getVariantsByProductId(product_id);

      res.status(200).json({
        success: true,
        data: variants,
        count: variants.length,
      });
    } catch (error) {
      next(error);
    }
  };

  createVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('POST /product/variant/create - Creando nueva variante');

      const shopifyVariantId = await this.variantService.createVariant(
        req.body.productId,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Variante creada exitosamente',
        data: {
          shopify_variant_id: shopifyVariantId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createVariantForProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { producto_id } = req.params;
      logger.info(
        `POST /product/variant/create/${producto_id} - Creando variante para producto`
      );

      const shopifyVariantId = await this.variantService.createVariant(
        producto_id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Variante creada exitosamente',
        data: {
          shopify_variant_id: shopifyVariantId,
        },
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
      const { shopify_variant_id } = req.params;
      logger.info(
        `PUT /product/variant/update/${shopify_variant_id} - Actualizando variante`
      );

      await this.variantService.updateVariant(shopify_variant_id, req.body);

      res.status(200).json({
        success: true,
        message: 'Variante actualizada exitosamente',
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
      const { shopify_variant_id } = req.params;
      logger.info(
        `PUT /product/variant/delete/${shopify_variant_id} - Desactivando variante`
      );

      await this.variantService.deleteVariant(shopify_variant_id);

      res.status(200).json({
        success: true,
        message: 'Variante desactivada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  bulkUpdatePrices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info(
        'POST /product/variants/update/price - Actualizando precios en masa'
      );

      const { updates } = req.body;
      await this.variantService.bulkUpdatePrices(updates);

      res.status(200).json({
        success: true,
        message: 'Precios actualizados exitosamente',
        count: updates.length,
      });
    } catch (error) {
      next(error);
    }
  };
}