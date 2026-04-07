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
              inventoryLevels(first: 1) {
                edges {
                  node {
                    location {
                      id
                    }
                  }
                }
              }
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

const GET_VARIANT_QUERY = `
  query GetVariant($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        title
        sku
        price
        inventoryQuantity
        product {
          id
        }
        inventoryItem {
          id
          inventoryLevels(first: 1) {
            edges {
              node {
                location {
                  id
                }
              }
            }
          }
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
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        sku
        price
        inventoryItem { id }
      }
      userErrors { field message }
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
  mutation BulkUpdatePrices($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
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

interface VariantData {
  node: ShopifyVariantNode | null;
}

interface CreateVariantData {
  productVariantCreate: {
    productVariant: { id: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface UpdateVariantData {
  productVariantsBulkUpdate: {
    productVariants: Array<{
      id: string;
      sku: string;
      price: string;
      inventoryItem: { id: string } | null;
    }>;
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

interface GetVariantData {
  node: {
    id: string;
    product: {
      id: string;
    } | null;
  } | null;
}

function formatShopifyId(id: string, type: string): string {
  if (id.startsWith('gid://')) return id;
  return `gid://shopify/${type}/${id}`;
}

interface ShopifyVariantNode {
  id: string;
  title: string;
  sku: string | null;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number;
  product: {
    id: string;
  } | null;
  inventoryItem: {
    id: string;
    inventoryLevels: {
      edges: Array<{
        node: {
          location: {
            id: string;
          };
        };
      }>;
    };
  } | null;
  selectedOptions: Array<{ name: string; value: string }>;
  image: { id: string } | null;
}

// Servicio de Variantes - Implementa IVariantService (DIP + SRP)
export class VariantService implements IVariantService {
  constructor(private readonly shopifyClient: IShopifyClient) { }

  async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    try {
      console.log('Obteniendo variantes del producto', { productId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<VariantsData>
      >(GET_VARIANTS_QUERY, { productId: formatShopifyId(productId, 'Product') });

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

      console.log(`Obtenidas ${variants.length} variantes`, { productId });
      return variants;
    } catch (error) {
      console.error('Error obteniendo variantes', { productId, error });
      throw error;
    }
  }

  async getVariantById(variantId: string): Promise<ProductVariant | null> {
    try {
      console.log('Obteniendo variante', { variantId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<VariantData>
      >(GET_VARIANT_QUERY, { id: formatShopifyId(variantId, 'ProductVariant') });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const node = response.data.node;
      if (!node) {
        return null;
      }

      return this.mapShopifyVariantToVariant(
        node,
        node.product?.id || ''
      );
    } catch (error) {
      console.error('Error obteniendo variante', { variantId, error });
      throw error;
    }
  }

  async createVariant(
    productId: string,
    input: CreateVariantInput
  ): Promise<string> {
    try {
      console.log('Creando variante', { productId, title: input.title });

      const response = await this.shopifyClient.request<
        ShopifyResponse<CreateVariantData>
      >(CREATE_VARIANT_MUTATION, {
        input: {
          productId: formatShopifyId(productId, 'Product'),
          price: input.price,
          sku: input.sku,
          compareAtPrice: input.compareAtPrice,
          optionValues: input.optionValues?.map((ov) => ({
            optionName: ov.optionName,
            name: ov.name,
          })),
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

      console.log('Variante creada exitosamente', {
        variantId: productVariant.id
      });

      return productVariant.id;
    } catch (error) {
      console.error('Error creando variante', { productId, error });
      throw error;
    }
  }

  async updateVariant(
    variantId: string,
    input: UpdateVariantInput
  ): Promise<void> {
    try {
      console.log('Actualizando variante', { variantId });

      let productId = input.productId;

      if (!productId) {
        const variantResponse = await this.shopifyClient.request<
          ShopifyResponse<GetVariantData>
        >(GET_VARIANT_QUERY, { id: formatShopifyId(variantId, 'ProductVariant') });

        if (variantResponse.errors && variantResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error obteniendo variante: ${variantResponse.errors[0].message}`
          );
        }

        productId = variantResponse.data.node?.product?.id;
        if (!productId) {
          throw new NotFoundError(`No se encontró producto para la variante ${variantId}`);
        }
      }

      const response = await this.shopifyClient.request<
        ShopifyResponse<UpdateVariantData>
      >(UPDATE_VARIANT_MUTATION, {
        productId,
        variants: [
          {
            id: formatShopifyId(variantId, 'ProductVariant'),
            price: input.price,
            sku: input.sku,
            compareAtPrice: input.compareAtPrice,
            inventoryQuantities: input.inventoryQuantity
              ? [
                {
                  availableQuantity: input.inventoryQuantity,
                  locationId: input.locationId || '',
                },
              ]
              : undefined,
          },
        ],
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { userErrors } = response.data.productVariantsBulkUpdate;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error actualizando variante: ${userErrors[0].message}`
        );
      }

      console.log('Variante actualizada exitosamente', { variantId });
    } catch (error) {
      console.error('Error actualizando variante', { variantId, error });
      throw error;
    }
  }

  async deleteVariant(variantId: string): Promise<void> {
    try {
      console.log('Desactivando variante', { variantId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<DeleteVariantData>
      >(DELETE_VARIANT_MUTATION, { id: formatShopifyId(variantId, 'ProductVariant') });

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

      console.log('Variante desactivada exitosamente', { variantId });
    } catch (error) {
      console.error('Error desactivando variante', { variantId, error });
      throw error;
    }
  }

  async bulkUpdatePrices(updates: BulkPriceUpdateInput[]): Promise<void> {
    try {
      console.log('Actualizando precios en masa', { count: updates.length });

      // Group updates by product ID since productVariantsBulkUpdate requires productId
      const updatesByProduct = new Map<string, BulkPriceUpdateInput[]>();

      for (const update of updates) {
        if (!updatesByProduct.has(update.shopifyId)) {
          updatesByProduct.set(update.shopifyId, []);
        }
        updatesByProduct.get(update.shopifyId)!.push(update);
      }

      // Process each product's variants
      for (const [productId, productUpdates] of updatesByProduct.entries()) {
        // Shopify tiene un límite de 100 variantes por operación bulk
        const BATCH_SIZE = 100;

        for (let i = 0; i < productUpdates.length; i += BATCH_SIZE) {
          const batch = productUpdates.slice(i, i + BATCH_SIZE);

          console.log(`Procesando batch para producto ${productId}`, {
            batchSize: batch.length,
          });

          const variantsInput = batch.map((update) => ({
            id: formatShopifyId(update.shopifyVariantId, 'ProductVariant'),
            price: update.price,
            compareAtPrice: update.compareAtPrice,
          }));

          const response = await this.shopifyClient.request<
            ShopifyResponse<BulkUpdatePricesData>
          >(BULK_UPDATE_PRICES_MUTATION, {
            productId: formatShopifyId(productId, 'Product'),
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
          if (i + BATCH_SIZE < productUpdates.length) {
            await this.delay(1000);
          }
        }
      }

      console.log('Precios actualizados exitosamente', {
        totalUpdates: updates.length
      });
    } catch (error) {
      console.error('Error actualizando precios en masa', { error });
      throw error;
    }
  }

  private mapShopifyVariantToVariant(
    node: ShopifyVariantNode,
    productId: string
  ): ProductVariant {
    const locationId = node.inventoryItem?.inventoryLevels?.edges?.[0]?.node?.location?.id;

    return {
      id: node.id,
      productId,
      title: node.title,
      sku: node.sku || undefined,
      price: node.price,
      compareAtPrice: node.compareAtPrice || undefined,
      inventoryQuantity: node.inventoryQuantity,
      inventoryItemId: node.inventoryItem?.id,
      locationId: locationId || undefined,
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