import { IInventoryService, IProductService, IVariantService, InventoryProductUpdate, InventoryVariantUpdate, Product, ProductVariant, ProductPage } from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError } from '../middleware/error.middleware';

export class InventoryService implements IInventoryService {
    constructor(
        private readonly productService: IProductService,
        private readonly variantService: IVariantService
    ) { }

    async listProductsInventory(first = 50, after?: string): Promise<ProductPage> {
        try {
            logger.info('Obteniendo inventario de productos', { first, after });
            return this.productService.getProductsPage(first, after);
        } catch (error) {
            logger.error('Error obteniendo inventario de productos', { error });
            throw error;
        }
    }

    async showProductInventory(productId: string): Promise<Product | null> {
        try {
            logger.info('Obteniendo inventario de producto', { productId });
            return this.productService.getProductById(productId);
        } catch (error) {
            logger.error('Error obteniendo inventario de producto', { productId, error });
            throw error;
        }
    }

    async updateProductInventory(productId: string, update: InventoryProductUpdate): Promise<void> {
        try {
            logger.info('Actualizando inventario de producto', { productId, update });

            if (update.productId !== productId) {
                throw new ShopifyAPIError('Product ID mismatch en request');
            }

            // Actualizamos cada variante correspondiente
            for (const variant of update.variants) {
                await this.variantService.updateVariant(variant.shopifyVariantId, {
                    inventoryQuantity: variant.inventoryQuantity,
                    locationId: variant.locationId,
                });
            }

            logger.info('Inventario de producto actualizado', { productId });
        } catch (error) {
            logger.error('Error actualizando inventario de producto', { productId, error });
            throw error;
        }
    }

    async listVariantsInventory(productId: string): Promise<ProductVariant[]> {
        try {
            logger.info('Obteniendo inventario de variantes', { productId });
            return this.variantService.getVariantsByProductId(productId);
        } catch (error) {
            logger.error('Error obteniendo inventario de variantes', { productId, error });
            throw error;
        }
    }

    async showVariantInventory(variantId: string): Promise<ProductVariant | null> {
        try {
            logger.info('Obteniendo inventario de variante', { variantId });
            return this.variantService.getVariantById(variantId);
        } catch (error) {
            logger.error('Error obteniendo inventario de variante', { variantId, error });
            throw error;
        }
    }

    async updateVariantInventory(update: InventoryVariantUpdate): Promise<void> {
        try {
            logger.info('Actualizando inventario de variante', { update });

            await this.variantService.updateVariant(update.shopifyVariantId, {
                inventoryQuantity: update.inventoryQuantity,
                locationId: update.locationId,
            });

            logger.info('Inventario de variante actualizado', { variantId: update.shopifyVariantId });
        } catch (error) {
            logger.error('Error actualizando inventario de variante', { update, error });
            throw error;
        }
    }

    async bulkUpdateVariantsInventory(updates: InventoryVariantUpdate[]): Promise<void> {
        try {
            logger.info('Actualizando inventario de variantes en masa', { count: updates.length });

            for (const update of updates) {
                await this.updateVariantInventory(update);
            }

            logger.info('Inventario de variantes actualizado en masa', { count: updates.length });
        } catch (error) {
            logger.error('Error actualizando inventario de variantes en masa', { error });
            throw error;
        }
    }
}
