import { 
  IImageService, 
  IShopifyClient,
  ProductImage, 
  CreateImageInput,
  ShopifyResponse 
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError, NotFoundError, BadRequestError } from '../middleware/error.middleware';

// Queries y Mutations GraphQL
const GET_IMAGES_QUERY = `
  query GetImages($productId: ID!) {
    product(id: $productId) {
      images(first: 100) {
        edges {
          node {
            id
            url
            altText
            variantIds
          }
        }
      }
    }
  }
`;

const CREATE_IMAGE_MUTATION = `
  mutation CreateImage($input: ImageInput!, $productId: ID!) {
    productImageCreate(image: $input, productId: $productId) {
      image {
        id
        url
        altText
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ATTACH_IMAGE_TO_VARIANT_MUTATION = `
  mutation AttachImageToVariant($productId: ID!, $imageId: ID!, $variantIds: [ID!]!) {
    productImageUpdate(
      productId: $productId
      id: $imageId
      variantIds: $variantIds
    ) {
      image {
        id
        variantIds
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ImagesData {
  product: {
    images: {
      edges: Array<{
        node: ShopifyImageNode;
      }>;
    };
  } | null;
}

interface CreateImageData {
  productImageCreate: {
    image: { id: string; url: string; altText: string | null } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface AttachImageData {
  productImageUpdate: {
    image: { id: string; variantIds: string[] } | null;
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

interface ShopifyImageNode {
  id: string;
  url: string;
  altText: string | null;
  variantIds: string[];
}

// Servicio de Imágenes - Implementa IImageService (DIP + SRP)
export class ImageService implements IImageService {
  constructor(private readonly shopifyClient: IShopifyClient) {}

  async getImagesByProductId(productId: string): Promise<ProductImage[]> {
    try {
      logger.info('Obteniendo imágenes del producto', { productId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<ImagesData>
      >(GET_IMAGES_QUERY, { productId });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      if (!response.data.product) {
        throw new NotFoundError(`Producto ${productId} no encontrado`);
      }

      const images = response.data.product.images.edges.map((edge) => ({
        id: edge.node.id,
        url: edge.node.url,
        altText: edge.node.altText || undefined,
        variantIds: edge.node.variantIds,
      }));

      logger.info(`Obtenidas ${images.length} imágenes`, { productId });
      return images;
    } catch (error) {
      logger.error('Error obteniendo imágenes', { productId, error });
      throw error;
    }
  }

  async addImageToVariant(
    productId: string,
    variantId: string,
    input: CreateImageInput
  ): Promise<string> {
    try {
      logger.info('Agregando imagen a variante', { productId, variantId });

      // Primero creamos la imagen
      const createResponse = await this.shopifyClient.request<
        ShopifyResponse<CreateImageData>
      >(CREATE_IMAGE_MUTATION, {
        productId,
        input: {
          src: input.src,
          altText: input.altText,
        },
      });

      if (createResponse.errors && createResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${createResponse.errors[0].message}`
        );
      }

      const { image: createdImage, userErrors: createErrors } = 
        createResponse.data.productImageCreate;

      if (createErrors.length > 0) {
        throw new BadRequestError(
          `Error creando imagen: ${createErrors[0].message}`
        );
      }

      if (!createdImage) {
        throw new ShopifyAPIError('No se pudo crear la imagen');
      }

      // Luego asociamos la imagen a la variante
      const attachResponse = await this.shopifyClient.request<
        ShopifyResponse<AttachImageData>
      >(ATTACH_IMAGE_TO_VARIANT_MUTATION, {
        productId,
        imageId: createdImage.id,
        variantIds: [variantId],
      });

      if (attachResponse.errors && attachResponse.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${attachResponse.errors[0].message}`
        );
      }

      const { userErrors: attachErrors } = attachResponse.data.productImageUpdate;

      if (attachErrors.length > 0) {
        throw new BadRequestError(
          `Error asociando imagen a variante: ${attachErrors[0].message}`
        );
      }

      logger.info('Imagen agregada exitosamente', { 
        imageId: createdImage.id,
        variantId 
      });

      return createdImage.id;
    } catch (error) {
      logger.error('Error agregando imagen a variante', { 
        productId, 
        variantId, 
        error 
      });
      throw error;
    }
  }
}