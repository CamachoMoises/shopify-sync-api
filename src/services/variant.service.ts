import { 
  IVariantService, 
  IShopifyClient,
  ProductVariant, 
  CreateVariantInput, 
  UpdateVariantInput,
  BulkPriceUpdateInput,
  ShopifyResponse 
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError, NotFoundError, BadRequestError } from '../middleware/error.middleware';

// Queries y Mutations GraphQL
const GET_VARIANTS_QUERY = `
  query GetVariants($productId: ID!) {
    product(id: $productId) {
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            inventoryItem {
              id
            }
            selectedOptions {
              name
              value
            }
            image {
              id
            }
          }
        }
      }
    }
  }
`;

const CREATE_VARIANT_MUTATION = `
  mutation CreateVariant($input: ProductVariantInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_VARIANT_MUTATION = `
  mutation UpdateVariant($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_VARIANT_MUTATION = `
  mutation DeleteVariant($id: ID!) {
    productVariantDelete(id: $id) {
      deletedProductVariantId
      userErrors {
        field
        message
      }
    }
  }
`;

const BULK_UPDATE_PRICES_MUTATION = `
  mutation BulkUpdatePrices($variants: [ProductVariantInput!]!) {
    productVariantsBulkUpdate(variants: $variants) {
      productVariants {
        id
        price
        compareAtPrice
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface VariantsData {
  product: {
    variants: {
      edges: Array<{
        node: ShopifyVariantNode;
      }>;
    };
  } | null;
}

interface CreateVariantData {
  productVariantCreate: {
    productVariant: { id: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface UpdateVariantData {
  productVariantUpdate: {
    productVariant: { id: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface DeleteVariantData {
  productVariantDelete: {
    deletedProductVariantId: string | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface BulkUpdatePricesData {
  productVariantsBulkUpdate: {
    productVariants: Array<{
      id: string;
      price: string;
      compareAtPrice: string | null;
    }>;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface ShopifyVariantNode {
  id: string;
  title: string;
  sku: string | null;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number;
  inventoryItem: { id: string } | null;
  selectedOptions: Array<{ name: string; value: string }>;
  image: { id: string } | null;
}

// Servicio de Variantes - Implementa IVariantService (DIP + SRP)
export class VariantService implements IVariantService {
  constructor(private readonly shopifyClient: IShopifyClient) {}

  async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    try {
      logger.info('Obteniendo variantes del producto', { productId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<VariantsData>
      >(GET_VARIANTS_QUERY, { productId });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      if (!response.data.product) {
        throw new NotFoundError(`Producto ${productId} no encontrado`);
      }

      const variants = response.data.product.variants.edges.map((edge) =>
        this.mapShopifyVariantToVariant(edge.node, productId)
      );

      logger.info(`Obtenidas ${variants.length} variantes`, { productId });
      return variants;
    } catch (error) {
      logger.error('Error obteniendo variantes', { productId, error });
      throw error;
    }
  }

  async createVariant(
    productId: string, 
    input: CreateVariantInput
  ): Promise<string> {
    try {
      logger.info('Creando variante', { productId, title: input.title });

      const response = await this.shopifyClient.request<
        ShopifyResponse<CreateVariantData>
      >(CREATE_VARIANT_MUTATION, {
        input: {
          productId,
          price: input.price,
          sku: input.sku,
          compareAtPrice: input.compareAtPrice,
          options: input.options?.map((opt) => opt.value),
          inventoryQuantities: input.inventoryQuantity
            ? [
                {
                  availableQuantity: input.inventoryQuantity,
                  locationId: '', // Se debe obtener de locations
                },
              ]
            : undefined,
        },
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { productVariant, userErrors } = response.data.productVariantCreate;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error creando variante: ${userErrors[0].message}`
        );
      }

      if (!productVariant) {
        throw new ShopifyAPIError('No se pudo crear la variante');
      }

      logger.info('Variante creada exitosamente', { 
        variantId: productVariant.id 
      });

      return productVariant.id;
    } catch (error) {
      logger.error('Error creando variante', { productId, error });
      throw error;
    }
  }

  async updateVariant(
    variantId: string, 
    input: UpdateVariantInput
  ): Promise<void> {
    try {
      logger.info('Actualizando variante', { variantId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<UpdateVariantData>
      >(UPDATE_VARIANT_MUTATION, {
        input: {
          id: variantId,
          price: input.price,
          sku: input.sku,
          compareAtPrice: input.compareAtPrice,
        },
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { userErrors } = response.data.productVariantUpdate;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error actualizando variante: ${userErrors[0].message}`
        );
      }

      logger.info('Variante actualizada exitosamente', { variantId });
    } catch (error) {
      logger.error('Error actualizando variante', { variantId, error });
      throw error;
    }
  }

  async deleteVariant(variantId: string): Promise<void> {
    try {
      logger.info('Desactivando variante', { variantId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<DeleteVariantData>
      >(DELETE_VARIANT_MUTATION, { id: variantId });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { userErrors } = response.data.productVariantDelete;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error desactivando variante: ${userErrors[0].message}`
        );
      }

      logger.info('Variante desactivada exitosamente', { variantId });
    } catch (error) {
      logger.error('Error desactivando variante', { variantId, error });
      throw error;
    }
  }

  async bulkUpdatePrices(updates: BulkPriceUpdateInput[]): Promise<void> {
    try {
      logger.info('Actualizando precios en masa', { count: updates.length });

      // Shopify tiene un límite de 100 variantes por operación bulk
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        
        logger.info(`Procesando batch ${Math.floor(i / BATCH_SIZE) + 1}`, {
          batchSize: batch.length,
        });

        const variantsInput = batch.map((update) => ({
          id: update.shopifyVariantId,
          price: update.price,
          compareAtPrice: update.compareAtPrice,
        }));

        const response = await this.shopifyClient.request<
          ShopifyResponse<BulkUpdatePricesData>
        >(BULK_UPDATE_PRICES_MUTATION, {
          variants: variantsInput,
        });

        if (response.errors && response.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${response.errors[0].message}`
          );
        }

        const { userErrors } = response.data.productVariantsBulkUpdate;

        if (userErrors.length > 0) {
          throw new BadRequestError(
            `Error en actualización masiva: ${userErrors[0].message}`
          );
        }

        // Delay entre batches para no exceder límites de rate limit
        if (i + BATCH_SIZE < updates.length) {
          await this.delay(1000);
        }
      }

      logger.info('Precios actualizados exitosamente', { 
        totalUpdates: updates.length 
      });
    } catch (error) {
      logger.error('Error actualizando precios en masa', { error });
      throw error;
    }
  }

  private mapShopifyVariantToVariant(
    node: ShopifyVariantNode, 
    productId: string
  ): ProductVariant {
    return {
      id: node.id,
      productId,
      title: node.title,
      sku: node.sku || undefined,
      price: node.price,
      compareAtPrice: node.compareAtPrice || undefined,
      inventoryQuantity: node.inventoryQuantity,
      inventoryItemId: node.inventoryItem?.id,
      options: node.selectedOptions.map((opt) => ({
        name: opt.name,
        value: opt.value,
      })),
      imageId: node.image?.id,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}