import {
  IProductService,
  IShopifyClient,
  Product,
  ProductPage,
  CreateProductInput,
  UpdateProductInput,
  ShopifyResponse,
  AddVariantsPayload,
  SimpleProduct
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError, NotFoundError } from '../middleware/error.middleware';

function formatShopifyId(id: string, type: string): string {
  if (id.startsWith('gid://')) return id;
  return `gid://shopify/${type}/${id}`;
}

// Queries y Mutations GraphQL
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          description
          vendor
          productType
          tags
          status
          publishedAt
          createdAt
          updatedAt
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
              }
            }
          }
          images(first: 100) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          resourcePublications(first: 100) {
            edges {
              node {
                publication {
                  id
                  name
                }
                publishDate
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_PRODUCT_WITH_OPTIONS_AND_VARIANTS_QUERY = `
  query GetProductWithOptionsAndVariants($id: ID!) {
    product(id: $id) {
      id
      title
      options {
        id
        name
        values
      }
      variants(first: 50) {
        nodes {
          id
          title
          sku
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

const GET_PRODUCTS_SIMPLE_QUERY = `
  query GetProductsSimple($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          variants(first: 100) {
            edges {
              node {
                id
                sku
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_PRODUCT_BY_ID_QUERY = `
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      title
      description
      vendor
      productType
      tags
      status
      publishedAt
      createdAt
      updatedAt
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
          }
        }
      }
      images(first: 100) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      resourcePublications(first: 100) {
        edges {
          node {
            publication {
              id
              name
            }
            publishDate
          }
        }
      }
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        variants(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;


const CREATE_OPTIONS_MUTATION = `
  mutation productOptionsCreate($productId: ID!, $options: [OptionCreateInput!]!) {
    productOptionsCreate(productId: $productId, options: $options) {
      product {
        id
        options {
          id
          name
          optionValues {
            id
            name
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;


const CREATE_VARIANTS_MUTATION = `
  mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      productVariants {
        id
        sku
        inventoryItem { id }
      }
      userErrors { field message }
    }
  }
`;

const UPDATE_VARIANTS_MUTATION = `
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

const DELETE_VARIANTS_MUTATION = `
  mutation productVariantsBulkDelete($productId: ID!, $variantsIds: [ID!]!) {
    productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {
      userErrors { field message }
    }
  }
`;

const INVENTORY_ADJUST_MUTATION = `
  mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup { id }
      userErrors { field message }
    }
  }
`;

const PUBLISH_PRODUCT_MUTATION = `
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product {
          id
          title
        }
      }
      userErrors { field message }
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_PRODUCT_MEDIA_QUERY = `
  query GetProductMedia($id: ID!) {
    product(id: $id) {
      media(first: 250) {
        edges {
          node {
            id
            mediaContentType
            status
          }
        }
      }
    }
  }
`;


const DELETE_PRODUCT_MEDIA_MUTATION = `
  mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      userErrors { field message }
    }
  }
`;

const CREATE_PRODUCT_MEDIA_MUTATION = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        id
        mediaContentType
        status
      }
      userErrors { field message }
    }
  }
`;

const ASSIGN_VARIANT_IMAGE_MUTATION = `
  mutation productVariantAppendMedia(
    $productId: ID!
    $variantMedia: [ProductVariantAppendMediaInput!]!
  ) {
    productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
      productVariants {
        id
        media(first: 5) {
          edges { node { id } }
        }
      }
      userErrors { field message }
    }
  }
`;

interface ProductsData {
  products: {
    edges: Array<{
      node: ShopifyProductNode;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface SimpleProductNode {
  id: string;
  variants: {
    edges: Array<{
      node: {
        id: string;
        sku: string | null;
      };
    }>;
  };
}

interface ProductsSimpleData {
  products: {
    edges: Array<{
      node: SimpleProductNode;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

interface ProductData {
  product: ShopifyProductNode | null;
}

interface ProductWithOptionsAndVariantsData {
  product: {
    id: string;
    title: string;
    options: Array<{
      id: string;
      name: string;
      values: string[];
    }>;
    variants: {
      nodes: Array<{
        id: string;
        title: string;
        sku: string | null;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      }>;
    };
  } | null;
}

interface CreateProductData {
  productCreate: {
    product: {
      id: string;
      variants: {
        edges: Array<{
          node: CreatedVariantNode;
        }>;
      };
    } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface CreateVariantsData {
  productVariantsBulkCreate: {
    productVariants: CreatedVariantNode[] | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface UpdateVariantsData {
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

interface UpdateVariantInput {
  id: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';
  inventoryPolicy?: 'DENY' | 'CONTINUE';
  taxable?: boolean;
}

interface CreateOptionsData {
  productOptionsCreate: {
    product: {
      id: string;
      options: Array<{
        id: string;
        name: string;
        optionValues: Array<{ id: string; name: string }>;
      }>;
    } | null;
    userErrors: Array<{ field: string[]; message: string; code?: string }>;
  };
}
interface PublishProductData {
  publishablePublish: {
    publishable: { id: string; title: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}
interface InventoryAdjustData {
  inventoryAdjustQuantities: {
    inventoryAdjustmentGroup: { id: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}
interface UpdateProductData {
  productUpdate: {
    product: { id: string } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface DeleteProductData {
  productDelete: {
    deletedProductId: string | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface UpdateVariantInput {
  id: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
}

interface UpdateVariantPayload {
  productId: string;
  variants: UpdateVariantInput[];
}

interface DeleteVariantInput {
  id: string;
}

interface DeleteVariantPayload {
  productId: string;
  variants: DeleteVariantInput[];
}

interface DeleteVariantsData {
  productVariantsBulkDelete: {
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface CreatedVariantNode {
  id: string;
  sku: string | null;
  inventoryItem: { id: string } | null;
}

interface ShopifyProductNode {
  id: string;
  title: string;
  description: string | null;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string | null;
        price: string;
        compareAtPrice: string | null;
        inventoryQuantity: number;
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
      };
    }>;
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string | null;
      };
    }>;
  };
  resourcePublications: {
    edges: Array<{
      node: {
        publication: {
          id: string;
          name: string;
        };
        publishDate: string | null;
      };
    }>;
  };
}
// ============================================
// IMÁGENES DE VARIANTES
// ============================================

export interface VariantImageInput {
  id: string;   // gid://shopify/ProductVariant/...
  image: string; // URL pública de la imagen
}

export interface UpdateVariantImagesInput {
  productId: string;
  variants: VariantImageInput[];
}

interface ProductMediaNode {
  id: string;
  mediaContentType: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
}

interface GetProductMediaData {
  product: {
    media: {
      edges: Array<{ node: ProductMediaNode }>;
    };
  };
}

interface DeleteMediaData {
  productDeleteMedia: {
    deletedMediaIds: string[];
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface CreateMediaData {
  productCreateMedia: {
    media: Array<{
      id: string;
      mediaContentType: string;
      status: string;
    }>;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface AssignVariantImageData {
  productVariantAppendMedia: {
    productVariants: Array<{
      id: string;
      media: {
        edges: Array<{ node: { id: string } }>;
      };
    }>;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

// Servicio de Productos - Implementa IProductService (DIP + SRP)
export class ProductService implements IProductService {
  constructor(private readonly shopifyClient: IShopifyClient) { }

  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('Obteniendo todos los productos de Shopify');
      const allProducts: Product[] = [];
      let after: string | null = null;
      const chunkSize = 50;

      do {
        const page = await this.getProductsPage(chunkSize, after || undefined);
        allProducts.push(...page.products);
        after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
      } while (after);

      console.log(`Obtenidos ${allProducts.length} productos`);
      return allProducts;
    } catch (error) {
      console.error('Error obteniendo productos', { error });
      throw error;
    }
  }

  async getAllProductsSimple(): Promise<SimpleProduct[]> {
    try {
      console.log('Obteniendo productos simples de Shopify');
      const allProducts: SimpleProduct[] = [];
      let after: string | null = null;
      const chunkSize = 50;

      do {
        const response: ShopifyResponse<ProductsSimpleData> = await this.shopifyClient.request<
          ShopifyResponse<ProductsSimpleData>
        >(GET_PRODUCTS_SIMPLE_QUERY, { first: chunkSize, after });

        if (response.errors && response.errors.length > 0) {
          throw new ShopifyAPIError(`Error de Shopify: ${response.errors[0].message}`);
        }

        const products: SimpleProduct[] = response.data.products.edges.map(
          (edge: { node: SimpleProductNode }) => ({
            productId: edge.node.id,
            variants: edge.node.variants.edges.map(
              (v: { node: { id: string; sku: string | null } }) => ({
                variantId: v.node.id,
                sku: v.node.sku || undefined,
              })
            ),
          })
        );

        allProducts.push(...products);
        after = response.data.products.pageInfo.hasNextPage
          ? response.data.products.pageInfo.endCursor
          : null;
      } while (after);

      console.log(`Obtenidos ${allProducts.length} productos simples`);
      return allProducts;
    } catch (error) {
      console.error('Error obteniendo productos simples', { error });
      throw error;
    }
  }

  async getProductsPage(first: number, after?: string): Promise<ProductPage> {
    try {
      console.log('Obteniendo página de productos de Shopify', { first, after });
      const variables: { first: number; after?: string } = { first };
      if (after) variables.after = after;
      const response: ShopifyResponse<ProductsData> = await this.shopifyClient.request<
        ShopifyResponse<ProductsData>
      >(GET_PRODUCTS_QUERY, variables);

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(`Error de Shopify: ${response.errors[0].message}`);
      }

      const products = response.data.products.edges.map((edge) =>
        this.mapShopifyProductToProduct(edge.node)
      );
      const { hasNextPage, endCursor } = response.data.products.pageInfo;
      console.log('Page result', {
        productCount: products.length,
        firstProductId: products[0]?.id,
        lastProductId: products[products.length - 1]?.id,
        hasNextPage,
        endCursor,
      });
      return {
        products,
        pageInfo: {
          hasNextPage,
          endCursor: endCursor ?? null,
        },
      };
    } catch (error) {
      console.error('Error obteniendo página de productos', { error });
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      console.log('Obteniendo producto por ID', { productId });

      const formattedId = productId.startsWith('gid://')
        ? productId
        : `gid://shopify/Product/${productId}`;
      console.log('Formatted product ID', { formattedId });
      const response = await this.shopifyClient.request<
        ShopifyResponse<ProductData>
      >(GET_PRODUCT_BY_ID_QUERY, { id: formattedId });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      if (!response.data.product) {
        throw new NotFoundError(`Producto ${productId} no encontrado`);
      }

      return this.mapShopifyProductToProduct(response.data.product);
    } catch (error) {
      console.error('Error obteniendo producto', { productId, error });
      throw error;
    }
  }
  async createProduct(input: CreateProductInput): Promise<string> {
    try {

      console.log('Creando producto en Shopify', { title: input.title });

      // ─── Paso 1: Crear producto base ───────────────────────────────────────
      const createProductResponse = await this.shopifyClient.request<
        ShopifyResponse<CreateProductData>
      >(CREATE_PRODUCT_MUTATION, {
        input: {
          title: input.title,
          descriptionHtml: input.description,
          vendor: input.vendor,
          productType: input.productType,
          tags: input.tags,
          status: 'ACTIVE',
        },
      });


      if (createProductResponse.errors && createProductResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${createProductResponse.errors[0].message}`
        );
      }

      const { product, userErrors } = createProductResponse.data.productCreate;

      if (userErrors.length > 0) {
        throw new BadRequestError(`Error creando producto: ${userErrors[0].message}`);
      }

      if (!product) {
        throw new ShopifyAPIError('No se pudo crear el producto');
      }

      const productId = product.id;
      // console.log('Producto base creado', { productId });

      // ─── Paso 2: Crear opciones del producto ────────────────────────────────
      if (input.options && input.options.length > 0) {
        const optionsInput = input.options.map((opt) => ({
          name: opt.name,
          values: opt.values.map((v) => ({ name: v.name })),
        }));

        const optionsResponse = await this.shopifyClient.request<
          ShopifyResponse<CreateOptionsData>
        >(CREATE_OPTIONS_MUTATION, {
          productId,
          options: optionsInput,
        });

        if (optionsResponse.errors && optionsResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${optionsResponse.errors[0].message}`
          );
        }

        const optionsUserErrors = optionsResponse.data.productOptionsCreate.userErrors;
        if (optionsUserErrors.length > 0) {
          throw new BadRequestError(
            `Error creando opciones: ${optionsUserErrors[0].message}`
          );
        }

        // console.log('Opciones creadas', { productId, count: input.options.length });
      }

      // ─── Paso 3: Verificar producto creado con opciones y variantes ────────
      const verificationResponse = await this.shopifyClient.request<
        ShopifyResponse<ProductWithOptionsAndVariantsData>
      >(GET_PRODUCT_WITH_OPTIONS_AND_VARIANTS_QUERY, { id: productId });

      if (verificationResponse.errors && verificationResponse.errors.length > 0) {
        logger.warn('Error verificando producto creado', {
          productId,
          error: verificationResponse.errors[0].message
        });
      } else if (verificationResponse.data.product) {
        // console.dir(verificationResponse.data.product, { depth: null })
      }
      // ─── Paso 4: Crear variantes (excepto la default) ─────────────────────
      const defaultVariant = verificationResponse.data.product?.variants.nodes[0];
      const defaultOptionValue = defaultVariant?.selectedOptions[0]?.value;

      const otherVariants = (input.variants ?? []).filter(
        (v) => !v.optionValues?.some((ov) => ov.name === defaultOptionValue)
      );

      let variantsResponse: ShopifyResponse<CreateVariantsData> | null = null;
      let updateResponse: ShopifyResponse<UpdateVariantsData> | null = null;

      if (otherVariants.length > 0) {
        const variantsInput = otherVariants.map((variant) => {
          const variantData: Record<string, unknown> = {
            price: variant.price,
          };

          if (variant.sku) {
            variantData.inventoryItem = { sku: variant.sku };
          }

          if (variant.compareAtPrice) {
            variantData.compareAtPrice = variant.compareAtPrice;
          }

          if (variant.optionValues && variant.optionValues.length > 0) {
            variantData.optionValues = variant.optionValues.map((ov) => ({
              optionName: ov.optionName,
              name: ov.name,
            }));
          }

          return variantData;
        });

        variantsResponse = await this.shopifyClient.request<
          ShopifyResponse<CreateVariantsData>
        >(CREATE_VARIANTS_MUTATION, {
          productId,
          variants: variantsInput,
        });

        if (variantsResponse.errors && variantsResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${variantsResponse.errors[0].message}`
          );
        }

        const variantsUserErrors = variantsResponse.data.productVariantsBulkCreate.userErrors;
        if (variantsUserErrors.length > 0) {
          throw new BadRequestError(
            `Error creando variantes: ${variantsUserErrors[0].message}`
          );
        }

        // console.log('Variantes creadas', {
        //   productId,
        //   count: variantsResponse.data.productVariantsBulkCreate.productVariants?.length ?? 0,
        // });
      }
      // ─── Paso 5: Actualizar variante default ──────────────────────────────
      const defaultInputVariant = (input.variants ?? []).find(
        (v) => v.optionValues?.some((ov) => ov.name === defaultOptionValue)
      );

      if (defaultInputVariant && defaultVariant) {
        const updateData: Record<string, unknown> = {
          id: defaultVariant.id,
          price: defaultInputVariant.price,
          inventoryItem: { tracked: true },
        };

        if (defaultInputVariant.sku) {
          updateData.inventoryItem = { tracked: true, sku: defaultInputVariant.sku };
        }

        if (defaultInputVariant.compareAtPrice) {
          updateData.compareAtPrice = defaultInputVariant.compareAtPrice;
        }

        updateResponse = await this.shopifyClient.request<
          ShopifyResponse<UpdateVariantsData>
        >(UPDATE_VARIANTS_MUTATION, {
          productId,
          variants: [updateData],
        });

        if (updateResponse.errors && updateResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${updateResponse.errors[0].message}`
          );
        }

        const updateUserErrors = updateResponse.data.productVariantsBulkUpdate.userErrors;
        if (updateUserErrors.length > 0) {
          throw new BadRequestError(
            `Error actualizando variante default: ${updateUserErrors[0].message}`
          );
        }

        // console.log('Variante default actualizada', {
        //   id: defaultVariant.id,
        //   price: defaultInputVariant.price,
        //   sku: defaultInputVariant.sku,
        // });
      }
      // ─── Paso 6: Ajustar inventario ───────────────────────────────────────
      const createdVariants =
        variantsResponse?.data.productVariantsBulkCreate.productVariants ?? [];
      const updatedVariant =
        updateResponse?.data.productVariantsBulkUpdate.productVariants?.[0];
      const allVariants = [
        ...createdVariants,
        ...(updatedVariant ? [updatedVariant] : []),
      ];

      const inventoryChanges = (input.variants ?? [])
        .filter((v) => v.inventoryQuantity !== undefined && v.inventoryQuantity > 0 && v.locationId)
        .map((v) => {
          const match = allVariants.find((cv) => cv.sku === v.sku);
          if (!match) {
            console.warn('No se encontró variante con SKU para inventario', { sku: v.sku });
            return null;
          }
          return {
            inventoryItemId: match.inventoryItem!.id,
            locationId: v.locationId,
            delta: v.inventoryQuantity,
          };
        })
        .filter(Boolean);

      if (inventoryChanges.length > 0) {
        const inventoryResponse = await this.shopifyClient.request<
          ShopifyResponse<InventoryAdjustData>
        >(INVENTORY_ADJUST_MUTATION, {
          input: {
            reason: 'correction',
            name: 'available',
            changes: inventoryChanges,
          },
        });

        if (inventoryResponse.errors && inventoryResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${inventoryResponse.errors[0].message}`
          );
        }

        const invUserErrors = inventoryResponse.data.inventoryAdjustQuantities.userErrors;
        if (invUserErrors.length > 0) {
          throw new BadRequestError(
            `Error ajustando inventario: ${invUserErrors[0].message}`
          );
        }

        // console.log('Inventario ajustado', {
        //   productId,
        //   variantCount: inventoryChanges.length,
        // });
      }

      // ─── Paso 7: Publicar producto ────────────────────────────────────────
      if (input.publishToPublications && input.publicationIds && input.publicationIds.length > 0) {
        const publishResponse = await this.shopifyClient.request<
          ShopifyResponse<PublishProductData>
        >(PUBLISH_PRODUCT_MUTATION, {
          id: productId,
          input: input.publicationIds.map((pubId) => ({
            publicationId: pubId,
          })),
        });

        if (publishResponse.errors && publishResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${publishResponse.errors[0].message}`
          );
        }

        const publishUserErrors = publishResponse.data.publishablePublish.userErrors;
        if (publishUserErrors.length > 0) {
          throw new BadRequestError(
            `Error publicando producto: ${publishUserErrors[0].message}`
          );
        }

        console.log('Producto publicado', {
          productId,
          publications: input.publicationIds,
        });
      }


      return productId;
    } catch (error) {
      console.error('Error creando producto', { error });
      throw error;
    }
  }

  async updateProduct(
    productId: string,
    input: UpdateProductInput
  ): Promise<void> {
    try {
      console.log('Actualizando producto', { productId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<UpdateProductData>
      >(UPDATE_PRODUCT_MUTATION, {
        input: {
          id: formatShopifyId(productId, 'Product'),
          title: input.title,
          descriptionHtml: input.description,
          vendor: input.vendor,
          productType: input.productType,
          tags: input.tags,
          status: input.status,
        },
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { userErrors } = response.data.productUpdate;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error actualizando producto: ${userErrors[0].message}`
        );
      }

      console.log('Producto actualizado exitosamente', { productId });
    } catch (error) {
      console.error('Error actualizando producto', { productId, error });
      throw error;
    }
  }

  async updateVariant(payload: UpdateVariantPayload): Promise<void> {
    try {
      console.log('Actualizando variantes', { productId: payload.productId });

      const variantsInput = payload.variants.map((variant) => {
        const variantData: Record<string, unknown> = {
          id: variant.id,
        };

        if (variant.price) {
          variantData.price = variant.price;
        }

        if (variant.compareAtPrice) {
          variantData.compareAtPrice = variant.compareAtPrice;
        }

        if (variant.sku) {
          variantData.inventoryItem = { sku: variant.sku };
        }

        return variantData;
      });

      const response = await this.shopifyClient.request<
        ShopifyResponse<UpdateVariantsData>
      >(UPDATE_VARIANTS_MUTATION, {
        productId: payload.productId,
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
          `Error actualizando variantes: ${userErrors[0].message}`
        );
      }

      console.log('Variantes actualizadas exitosamente', {
        productId: payload.productId,
        count: payload.variants.length,
      });
    } catch (error) {
      console.error('Error actualizando variantes', { error });
      throw error;
    }
  }

  async addVariants(payload: AddVariantsPayload): Promise<void> {
    try {
      console.log('Agregando variantes al producto', {
        productId: payload.productId,
        variantCount: payload.variants.length,
      });

      const variantsInput = payload.variants.map((variant) => {
        const variantData: Record<string, unknown> = {
          price: variant.price,
        };

        if (variant.sku) {
          variantData.inventoryItem = { sku: variant.sku };
        }

        if (variant.compareAtPrice) {
          variantData.compareAtPrice = variant.compareAtPrice;
        }

        if (variant.optionValues && variant.optionValues.length > 0) {
          variantData.optionValues = variant.optionValues.map((ov) => ({
            optionName: ov.optionName,
            name: ov.name,
          }));
        }

        return variantData;
      });

      const createResponse = await this.shopifyClient.request<
        ShopifyResponse<CreateVariantsData>
      >(CREATE_VARIANTS_MUTATION, {
        productId: payload.productId,
        variants: variantsInput,
      });

      if (createResponse.errors && createResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${createResponse.errors[0].message}`
        );
      }

      const createUserErrors = createResponse.data.productVariantsBulkCreate.userErrors;
      if (createUserErrors.length > 0) {
        throw new BadRequestError(
          `Error creando variantes: ${createUserErrors[0].message}`
        );
      }

      const createdVariants = createResponse.data.productVariantsBulkCreate.productVariants ?? [];

      const inventoryChanges = payload.variants
        .filter((v) => v.inventoryQuantity !== undefined && v.inventoryQuantity > 0 && v.locationId)
        .map((v, index) => {
          const match = createdVariants[index];
          if (!match?.inventoryItem?.id) {
            console.warn('No se encontró inventoryItem para variante creada', { sku: v.sku });
            return null;
          }
          return {
            inventoryItemId: match.inventoryItem.id,
            locationId: v.locationId!,
            delta: v.inventoryQuantity!,
          };
        })
        .filter(Boolean);

      if (inventoryChanges.length > 0) {
        const inventoryResponse = await this.shopifyClient.request<
          ShopifyResponse<InventoryAdjustData>
        >(INVENTORY_ADJUST_MUTATION, {
          input: {
            reason: 'correction',
            name: 'available',
            changes: inventoryChanges,
          },
        });

        if (inventoryResponse.errors && inventoryResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error de Shopify: ${inventoryResponse.errors[0].message}`
          );
        }

        const invUserErrors = inventoryResponse.data.inventoryAdjustQuantities.userErrors;
        if (invUserErrors.length > 0) {
          throw new BadRequestError(
            `Error ajustando inventario: ${invUserErrors[0].message}`
          );
        }
      }

      console.log('Variantes agregadas exitosamente', {
        productId: payload.productId,
        count: createdVariants.length,
      });
    } catch (error) {
      console.error('Error agregando variantes', { error });
      throw error;
    }
  }

  async deleteVariant(payload: DeleteVariantPayload): Promise<void> {
    try {
      console.log('Eliminando variantes', { productId: payload.productId });

      const variantIds = payload.variants.map((v) => v.id);

      const response = await this.shopifyClient.request<
        ShopifyResponse<DeleteVariantsData>
      >(DELETE_VARIANTS_MUTATION, {
        productId: payload.productId,
        variantsIds: variantIds,
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { userErrors } = response.data.productVariantsBulkDelete;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error eliminando variantes: ${userErrors[0].message}`
        );
      }

      console.log('Variantes eliminadas exitosamente', {
        productId: payload.productId,
        count: variantIds.length,
      });
    } catch (error) {
      console.error('Error eliminando variantes', { error });
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('Desactivando producto', { productId });

      // En Shopify no se eliminan productos, se archivan
      const response = await this.shopifyClient.request<
        ShopifyResponse<DeleteProductData>
      >(DELETE_PRODUCT_MUTATION, {
        input: {
          id: formatShopifyId(productId, 'Product'),
        },
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { userErrors } = response.data.productDelete;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error desactivando producto: ${userErrors[0].message}`
        );
      }

      console.log('Producto desactivado exitosamente', { productId });
    } catch (error) {
      console.error('Error desactivando producto', { productId, error });
      throw error;
    }
  }

  async updateVariantImages(input: UpdateVariantImagesInput): Promise<void> {
    try {
      console.log('Iniciando actualización de imágenes de variantes', {
        productId: input.productId,
        variantCount: input.variants.length,
      });

      // ─── Paso 1: Obtener imágenes existentes ──────────────────────────
      const mediaResponse = await this.shopifyClient.request<
        ShopifyResponse<GetProductMediaData>
      >(GET_PRODUCT_MEDIA_QUERY, { id: input.productId });

      if (mediaResponse.errors && mediaResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error obteniendo media: ${mediaResponse.errors[0].message}`
        );
      }

      const existingMediaIds = mediaResponse.data.product.media.edges.map(
        (edge) => edge.node.id
      );

      // ─── Paso 2: Eliminar imágenes existentes ─────────────────────────
      if (existingMediaIds.length > 0) {
        console.log(`Eliminando ${existingMediaIds.length} imágenes previas`);

        const deleteResponse = await this.shopifyClient.request<
          ShopifyResponse<DeleteMediaData>
        >(DELETE_PRODUCT_MEDIA_MUTATION, {
          productId: input.productId,
          mediaIds: existingMediaIds,
        });

        if (deleteResponse.errors && deleteResponse.errors.length > 0) {
          throw new ShopifyAPIError(
            `Error eliminando media: ${deleteResponse.errors[0].message}`
          );
        }

        if (deleteResponse.data.productDeleteMedia.userErrors.length > 0) {
          throw new BadRequestError(
            `Error eliminando imágenes: ${deleteResponse.data.productDeleteMedia.userErrors[0].message}`
          );
        }

        console.log('Imágenes previas eliminadas correctamente');
      }

      // ─── Paso 3: Cargar nuevas imágenes ───────────────────────────────
      const createResponse = await this.shopifyClient.request<
        ShopifyResponse<CreateMediaData>
      >(CREATE_PRODUCT_MEDIA_MUTATION, {
        productId: input.productId,
        media: input.variants.map((v) => ({
          originalSource: v.image,
          mediaContentType: 'IMAGE',
        })),
      });

      if (createResponse.errors && createResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error creando media: ${createResponse.errors[0].message}`
        );
      }

      if (createResponse.data.productCreateMedia.userErrors.length > 0) {
        throw new BadRequestError(
          `Error cargando imágenes: ${createResponse.data.productCreateMedia.userErrors[0].message}`
        );
      }

      const createdMedia = createResponse.data.productCreateMedia.media;
      const createdMediaIds = createdMedia.map((m) => m.id);

      console.log(`${createdMedia.length} imágenes cargadas, esperando procesamiento...`);

      // ─── Paso 3.5: Esperar a que estén READY ─────────────────────────
      await this.waitForMediaReady(input.productId, createdMediaIds);


      // ─── Paso 4: Asignar cada imagen a su variante ────────────────────
      const assignResponse = await this.shopifyClient.request<
        ShopifyResponse<AssignVariantImageData>
      >(ASSIGN_VARIANT_IMAGE_MUTATION, {
        productId: input.productId,
        variantMedia: input.variants.map((variant, index) => ({
          variantId: variant.id,
          mediaIds: [createdMedia[index].id],
        })),
      });

      if (assignResponse.errors && assignResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error asignando media: ${assignResponse.errors[0].message}`
        );
      }

      if (assignResponse.data.productVariantAppendMedia.userErrors.length > 0) {
        throw new BadRequestError(
          `Error asignando imágenes a variantes: ${assignResponse.data.productVariantAppendMedia.userErrors[0].message}`
        );
      }

      console.log('Imágenes asignadas a variantes correctamente', {
        productId: input.productId,
      });

    } catch (error) {
      console.error('Error actualizando imágenes de variantes', { error });
      throw error;
    }
  }

  private mapShopifyProductToProduct(node: ShopifyProductNode): Product {
    return {
      id: node.id,
      title: node.title,
      description: node.description || undefined,
      vendor: node.vendor || undefined,
      productType: node.productType || undefined,
      tags: node.tags,
      status: node.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
      publishedAt: node.publishedAt || undefined,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      variants: node.variants.edges.map((edge) => ({
        id: edge.node.id,
        productId: node.id,
        title: edge.node.title,
        sku: edge.node.sku || undefined,
        price: edge.node.price,
        compareAtPrice: edge.node.compareAtPrice || undefined,
        inventoryQuantity: edge.node.inventoryQuantity,
        inventoryItemId: edge.node.inventoryItem?.id,
        locationId: edge.node.inventoryItem?.inventoryLevels?.edges?.[0]?.node?.location?.id || undefined,
        options: edge.node.selectedOptions.map((opt) => ({
          name: opt.name,
          value: opt.value,
        })),
      })),
      images: node.images.edges.map((edge) => ({
        id: edge.node.id,
        url: edge.node.url,
        altText: edge.node.altText || undefined,
      })),
      resourcePublications: node.resourcePublications.edges.map((edge) => ({
        id: edge.node.publication.id,
        publication: {
          id: edge.node.publication.id,
          name: edge.node.publication.name,
        },
        publishedAt: edge.node.publishDate || undefined,
      })),
    };
  }
  private async waitForMediaReady(
    productId: string,
    mediaIds: string[],
    maxRetries = 15,
    delayMs = 2000
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      const response = await this.shopifyClient.request<
        ShopifyResponse<GetProductMediaData>
      >(GET_PRODUCT_MEDIA_QUERY, { id: productId });

      const mediaNodes = response.data.product.media.edges
        .map((e) => e.node)
        .filter((node) => mediaIds.includes(node.id));

      const failed = mediaNodes.filter((n) => n.status === 'FAILED');
      if (failed.length > 0) {
        throw new ShopifyAPIError(
          `Imágenes fallidas al procesar: ${failed.map((f) => f.id).join(', ')}`
        );
      }

      const allReady = mediaNodes.every((n) => n.status === 'READY');
      if (allReady) {
        console.log(`Media lista tras ${i + 1} intento(s)`);
        return;
      }

      console.log(`Esperando media... intento ${i + 1}/${maxRetries}`);
      await new Promise((res) => setTimeout(res, delayMs));
    }

    throw new ShopifyAPIError(
      'Timeout: las imágenes no estuvieron listas a tiempo'
    );
  }
}

// Importación necesaria para el error
import { BadRequestError } from '../middleware/error.middleware';
