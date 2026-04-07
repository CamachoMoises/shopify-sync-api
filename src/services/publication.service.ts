import {
    IShopifyClient,
    ShopifyResponse
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError } from '../middleware/error.middleware';


interface PublicationsData {
    publications: {
        edges: Array<{
            node: ShopifyPublicationNode;
        }>;
    };
}

interface ShopifyPublicationNode {
    id: string;
    name: string;
    catalog: {
        id: string;
        title: string;
    } | null;
    supportsFuturePublishing: boolean;
}

export interface Publication {
    id: string;
    name: string;
    catalogId?: string;
    catalogTitle?: string;
    supportsFuturePublishing: boolean;
}
const GET_PUBLICATIONS_QUERY = `
    query GetPublications($first: Int!) {
    publications(first: $first) {
        edges {
        node {
            id
            name
            catalog {
            id
            title
            }
            supportsFuturePublishing
        }
        }
    }
    }
`;
export class PublicationService {
    constructor(private readonly shopifyClient: IShopifyClient) { }

    async getAllPublications(): Promise<Publication[]> {
        try {
            console.log('Obteniendo todas las publicaciones de Shopify');

            const response = await this.shopifyClient.request<
                ShopifyResponse<PublicationsData>
            >(GET_PUBLICATIONS_QUERY, { first: 250 });

            if (response.errors && response.errors.length > 0) {
                throw new ShopifyAPIError(
                    `Error de Shopify: ${response.errors[0].message}`
                );
            }

            const publications = response.data.publications.edges.map((edge) => ({
                id: edge.node.id,
                name: edge.node.name,
                catalogId: edge.node.catalog?.id || undefined,
                catalogTitle: edge.node.catalog?.title || undefined,
                supportsFuturePublishing: edge.node.supportsFuturePublishing,
            }));

            console.log(`Obtenidas ${publications.length} publicaciones`);
            return publications;
        } catch (error) {
            console.error('Error obteniendo publicaciones', { error });
            throw error;
        }
    }

    // Utilidad: solo los IDs (útil para publishablePublish mutations)
    async getPublicationIds(): Promise<string[]> {
        const publications = await this.getAllPublications();
        return publications.map((p) => p.id);
    }
}