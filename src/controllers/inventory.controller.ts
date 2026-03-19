import { Request, Response, NextFunction } from 'express';
import { IInventoryService } from '../types';
import { logger } from '../config/logger.config';

export class InventoryController {
    constructor(private readonly inventoryService: IInventoryService) { }

    listProductsInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const first = Number(req.query.first || 50);
            const after = typeof req.query.after === 'string' ? req.query.after : undefined;

            logger.info('GET /inventory/products - Listado inventario productos', { first, after });

            const page = await this.inventoryService.listProductsInventory(first, after);

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


    showProductInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { product_id } = req.params;
            logger.info(`GET /inventory/products/${product_id} - Inventario producto`);

            const product = await this.inventoryService.showProductInventory(product_id);

            if (!product) {
                res.status(404).json({ success: false, message: 'Producto no encontrado' });
                return;
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    };

    updateProductInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { product_id } = req.params;
            const update = req.body;

            logger.info(`PUT /inventory/products/${product_id} - Actualizar inventario producto`);

            await this.inventoryService.updateProductInventory(product_id, update);

            res.status(200).json({
                success: true,
                message: 'Inventario de producto actualizado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    listVariantsInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { product_id } = req.params;
            logger.info(`GET /inventory/variants/${product_id} - Listado inventario variantes`);

            const variants = await this.inventoryService.listVariantsInventory(product_id);

            res.status(200).json({
                success: true,
                data: variants,
                count: variants.length,
            });
        } catch (error) {
            next(error);
        }
    };

    showVariantInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { variant_id } = req.params;
            logger.info(`GET /inventory/variant/${variant_id} - Inventario variante`);

            const variant = await this.inventoryService.showVariantInventory(variant_id);

            if (!variant) {
                res.status(404).json({ success: false, message: 'Variante no encontrada' });
                return;
            }

            res.status(200).json({ success: true, data: variant });
        } catch (error) {
            next(error);
        }
    };

    updateVariantInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { variant_id } = req.params;
            const { inventoryQuantity, locationId } = req.body;

            logger.info(`PUT /inventory/variant/${variant_id} - Actualizar inventario variante`);

            await this.inventoryService.updateVariantInventory({
                shopifyVariantId: variant_id,
                inventoryQuantity,
                locationId,
            });

            res.status(200).json({
                success: true,
                message: 'Inventario de variante actualizado exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    bulkUpdateVariantsInventory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { updates } = req.body;
            logger.info('POST /inventory/variants/bulk-update - Actualizar inventario variantes en masa');

            await this.inventoryService.bulkUpdateVariantsInventory(updates);

            res.status(200).json({
                success: true,
                message: 'Inventario de variantes actualizado en masa',
                count: updates.length,
            });
        } catch (error) {
            next(error);
        }
    };
}
