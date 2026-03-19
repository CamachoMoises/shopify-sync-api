import { 
  IProductService, 
  IShopifyClient,
  Product, 
  CreateProductInput, 
  UpdateProductInput,
  ShopifyResponse 
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError, NotFoundError } from '../middleware/error.middleware';

// Queries y Mutations GraphQL
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          vendor
          productType
          tags
          status
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
        }
      }
    }
  }
`;

const GET_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      vendor
      productType
      tags
      status
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
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
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

interface ProductsData {
  products: {
    edges: Array<{
      node: ShopifyProductNode;
    }>;
  };
}

interface ProductData {
  product: ShopifyProductNode | null;
}

interface CreateProductData {
  productCreate: {
    product: { id: string } | null;
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

interface ShopifyProductNode {
  id: string;
  title: string;
  description: string | null;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  status: string;
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
        inventoryItem: { id: string } | null;
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
}

// Servicio de Productos - Implementa IProductService (DIP + SRP)
export class ProductService implements IProductService {
  constructor(private readonly shopifyClient: IShopifyClient) {}

  async getAllProducts(): Promise<Product[]> {
    try {
      logger.info('Obteniendo todos los productos de Shopify');
      
      const response = await this.shopifyClient.request<
        ShopifyResponse<ProductsData>
      >(GET_PRODUCTS_QUERY, { first: 250 });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const products = response.data.products.edges.map((edge) =>
        this.mapShopifyProductToProduct(edge.node)
      );

      logger.info(`Obtenidos ${products.length} productos`);
      return products;
    } catch (error) {
      logger.error('Error obteniendo productos', { error });
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      logger.info('Obteniendo producto por ID', { productId });

      const formattedId = productId.startsWith('gid://') 
        ? productId 
        : `gid://shopify/Product/${productId}`;

      const response = await this.shopifyClient.request<
        ShopifyResponse<ProductData>
      >(GET_PRODUCT_QUERY, { id: formattedId });

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
      logger.error('Error obteniendo producto', { productId, error });
      throw error;
    }
  }

  async createProduct(input: CreateProductInput): Promise<string> {
    try {
      logger.info('Creando producto en Shopify', { title: input.title });

      const variantsInput = input.variants.map((variant) => ({
        price: variant.price,
        sku: variant.sku,
        compareAtPrice: variant.compareAtPrice,
        inventoryQuantities: variant.inventoryQuantity
          ? [
              {
                availableQuantity: variant.inventoryQuantity,
                locationId: '', // Se debe obtener de locations
              },
            ]
          : undefined,
        options: variant.options?.map((opt) => opt.value),
      }));

      const response = await this.shopifyClient.request<
        ShopifyResponse<CreateProductData>
      >(CREATE_PRODUCT_MUTATION, {
        input: {
          title: input.title,
          descriptionHtml: input.description,
          vendor: input.vendor,
          productType: input.productType,
          tags: input.tags,
          variants: variantsInput,
        },
      });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const { product, userErrors } = response.data.productCreate;

      if (userErrors.length > 0) {
        throw new BadRequestError(
          `Error creando producto: ${userErrors[0].message}`
        );
      }

      if (!product) {
        throw new ShopifyAPIError('No se pudo crear el producto');
      }

      logger.info('Producto creado exitosamente', { 
        productId: product.id 
      });

      return product.id;
    } catch (error) {
      logger.error('Error creando producto', { error });
      throw error;
    }
  }

  async updateProduct(
    productId: string, 
    input: UpdateProductInput
  ): Promise<void> {
    try {
      logger.info('Actualizando producto', { productId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<UpdateProductData>
      >(UPDATE_PRODUCT_MUTATION, {
        input: {
          id: productId,
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

      logger.info('Producto actualizado exitosamente', { productId });
    } catch (error) {
      logger.error('Error actualizando producto', { productId, error });
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      logger.info('Desactivando producto', { productId });

      // En Shopify no se eliminan productos, se archivan
      const response = await this.shopifyClient.request<
        ShopifyResponse<DeleteProductData>
      >(DELETE_PRODUCT_MUTATION, {
        input: {
          id: productId,
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

      logger.info('Producto desactivado exitosamente', { productId });
    } catch (error) {
      logger.error('Error desactivando producto', { productId, error });
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
    };
  }
}

// Importación necesaria para el error
import { BadRequestError } from '../middleware/error.middleware';