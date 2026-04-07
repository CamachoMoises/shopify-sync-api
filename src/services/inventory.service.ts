import { IInventoryService, IProductService, IVariantService, InventoryProductUpdate, InventoryVariantUpdate, PriceProductUpdate, Product, ProductVariant, ProductPage, IShopifyClient, ShopifyResponse } from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError, BadRequestError } from '../middleware/error.middleware';

const GET_VARIANT_INVENTORY_QUERY = `
  query getVariantInventory($id: ID!) {
    productVariant(id: $id) {
      id
      inventoryItem { id }
    }
  }
`;

const INVENTORY_SET_ON_HAND_MUTATION = `
  mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
    inventorySetOnHandQuantities(input: $input) {
      userErrors { field message }
    }
  }
`;

interface GetVariantInventoryData {
    productVariant: {
        id: string;
        inventoryItem: { id: string } | null;
    } | null;
}

interface InventorySetOnHandData {
    inventorySetOnHandQuantities: {
        userErrors: Array<{ field: string[]; message: string }>;
    };
}

export class InventoryService implements IInventoryService {
    constructor(
        private readonly productService: IProductService,
        private readonly variantService: IVariantService,
        private readonly shopifyClient: IShopifyClient
    ) { }

    async listProductsInventory(first = 50, after?: string): Promise<ProductPage> {
        try {
            console.log('Obteniendo inventario de productos', { first, after });
            return this.productService.getProductsPage(first, after);
        } catch (error) {
            console.error('Error obteniendo inventario de productos', { error });
            throw error;
        }
    }

    async showProductInventory(productId: string): Promise<Product | null> {
        try {
            console.log('Obteniendo inventario de producto', { productId });
            return this.productService.getProductById(productId);
        } catch (error) {
            console.error('Error obteniendo inventario de producto', { productId, error });
            throw error;
        }
    }
    async updateProductInventory(
        productId: string,
        update: InventoryProductUpdate
    ): Promise<void> {
        try {
            console.log('Actualizando inventario de producto', {
                productId,
                variantCount: update.variants.length,
            });

            for (const variantUpdate of update.variants) {
                const variantResponse = await this.shopifyClient.request<
                    ShopifyResponse<GetVariantInventoryData>
                >(GET_VARIANT_INVENTORY_QUERY, { id: variantUpdate.shopifyVariantId });

                if (variantResponse.errors && variantResponse.errors.length > 0) {
                    throw new ShopifyAPIError(
                        `Error de Shopify: ${variantResponse.errors[0].message}`
                    );
                }

                const variant = variantResponse.data.productVariant;
                if (!variant?.inventoryItem?.id) {
                    logger.warn('No se encontró inventoryItem para variante', {
                        shopifyVariantId: variantUpdate.shopifyVariantId,
                    });
                    continue;
                }

                const inventoryResponse = await this.shopifyClient.request<
                    ShopifyResponse<InventorySetOnHandData>
                >(INVENTORY_SET_ON_HAND_MUTATION, {
                    input: {
                        reason: 'correction',
                        setQuantities: [
                            {
                                inventoryItemId: variant.inventoryItem.id,
                                locationId: variantUpdate.locationId,
                                quantity: variantUpdate.inventoryQuantity,
                            },
                        ],
                    },
                });

                if (inventoryResponse.errors && inventoryResponse.errors.length > 0) {
                    throw new ShopifyAPIError(
                        `Error de Shopify: ${inventoryResponse.errors[0].message}`
                    );
                }

                const invUserErrors = inventoryResponse.data.inventorySetOnHandQuantities.userErrors;
                if (invUserErrors.length > 0) {
                    throw new BadRequestError(
                        `Error estableciendo inventario: ${invUserErrors[0].message}`
                    );
                }
            }

            console.log('Inventario de producto actualizado', {
                productId,
                variantCount: update.variants.length,
            });
        } catch (error) {
            logger.error('Error actualizando inventario', { productId, error });
            throw error;
        }
    }

    async listVariantsInventory(productId: string): Promise<ProductVariant[]> {
        try {
            console.log('Obteniendo inventario de variantes', { productId });
            return this.variantService.getVariantsByProductId(productId);
        } catch (error) {
            console.error('Error obteniendo inventario de variantes', { productId, error });
            throw error;
        }
    }

    async showVariantInventory(variantId: string): Promise<ProductVariant | null> {
        try {
            console.log('Obteniendo inventario de variante', { variantId });
            return this.variantService.getVariantById(variantId);
        } catch (error) {
            console.error('Error obteniendo inventario de variante', { variantId, error });
            throw error;
        }
    }

    async updateVariantInventory(update: InventoryVariantUpdate): Promise<void> {
        try {
            console.log('Actualizando inventario de variante', { update });

            await this.variantService.updateVariant(update.shopifyVariantId, {
                inventoryQuantity: update.inventoryQuantity,
                locationId: update.locationId,
            });

            console.log('Inventario de variante actualizado', { variantId: update.shopifyVariantId });
        } catch (error) {
            console.error('Error actualizando inventario de variante', { update, error });
            throw error;
        }
    }

    async updateProductPrices(
        productId: string,
        update: PriceProductUpdate
    ): Promise<void> {
        try {
            console.log('Actualizando precios de producto', {
                productId,
                variantCount: update.variants.length,
            });

            for (const variantUpdate of update.variants) {
                await this.variantService.updateVariant(variantUpdate.shopifyVariantId, {
                    price: variantUpdate.price,
                    compareAtPrice: variantUpdate.compareAtPrice,
                });
            }

            console.log('Precios de producto actualizados', {
                productId,
                variantCount: update.variants.length,
            });
        } catch (error) {
            console.error('Error actualizando precios de producto', { productId, error });
            throw error;
        }
    }

    async bulkUpdateVariantsInventory(updates: InventoryVariantUpdate[]): Promise<void> {
        try {
            console.log('Actualizando inventario de variantes en masa', { count: updates.length });

            for (const update of updates) {
                await this.updateVariantInventory(update);
            }

            console.log('Inventario de variantes actualizado en masa', { count: updates.length });
        } catch (error) {
            console.error('Error actualizando inventario de variantes en masa', { error });
            throw error;
        }
    }
}
