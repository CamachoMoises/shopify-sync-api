import { 
  ILocationService, 
  IShopifyClient,
  Location,
  ShopifyResponse 
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError } from '../middleware/error.middleware';

// Queries GraphQL
const GET_LOCATIONS_QUERY = `
  query GetLocations($first: Int!) {
    locations(first: $first) {
      edges {
        node {
          id
          name
          address {
            address1
            address2
            city
            province
            country
            zip
            phone
          }
          isActive
        }
      }
    }
  }
`;

interface LocationsData {
  locations: {
    edges: Array<{
      node: ShopifyLocationNode;
    }>;
  };
}

interface ShopifyLocationNode {
  id: string;
  name: string;
  address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    zip: string | null;
    phone: string | null;
  } | null;
  isActive: boolean;
}

// Servicio de Locaciones - Implementa ILocationService (DIP + SRP)
export class LocationService implements ILocationService {
  constructor(private readonly shopifyClient: IShopifyClient) {}

  async getAllLocations(): Promise<Location[]> {
    try {
      logger.info('Obteniendo todas las locaciones de Shopify');

      const response = await this.shopifyClient.request<
        ShopifyResponse<LocationsData>
      >(GET_LOCATIONS_QUERY, { first: 250 });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const locations = response.data.locations.edges.map((edge) => ({
        id: edge.node.id,
        name: edge.node.name,
        address: edge.node.address
          ? {
              address1: edge.node.address.address1 || undefined,
              address2: edge.node.address.address2 || undefined,
              city: edge.node.address.city || undefined,
              province: edge.node.address.province || undefined,
              country: edge.node.address.country || undefined,
              zip: edge.node.address.zip || undefined,
              phone: edge.node.address.phone || undefined,
            }
          : undefined,
        isActive: edge.node.isActive,
      }));

      logger.info(`Obtenidas ${locations.length} locaciones`);
      return locations;
    } catch (error) {
      logger.error('Error obteniendo locaciones', { error });
      throw error;
    }
  }
}