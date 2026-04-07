import { Request, Response, NextFunction } from 'express';
import { IImageService } from '../types';
import { logger } from '../config/logger.config';

// Controlador de Imágenes - Maneja HTTP requests (SRP)
export class ImageController {
  constructor(private readonly imageService: IImageService) { }

  getImagesByProductId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { product_id } = req.params;
      console.log(
        `GET /product/images/${product_id} - Obteniendo imágenes del producto`
      );

      const images = await this.imageService.getImagesByProductId(product_id);

      res.status(200).json({
        success: true,
        data: images,
        count: images.length,
      });
    } catch (error) {
      next(error);
    }
  };

  addImageToVariant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { product_id, shopify_variant_id } = req.params;
      console.log(
        `POST /product/images/add/${product_id}/${shopify_variant_id} - Agregando imagen a variante`
      );

      const imageId = await this.imageService.addImageToVariant(
        product_id,
        shopify_variant_id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: 'Imagen agregada exitosamente',
        data: {
          image_id: imageId,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}