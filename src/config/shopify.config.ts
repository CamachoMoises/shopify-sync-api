import { IShopifyClient } from '../types';

export interface ShopifyConfig {
  shopName: string;
  apiKey: string;
  apiSecret: string;
  shopUrl: string;
  accessToken: string;
  apiVersion: string;
  baseUrl: string;
}

export const getShopifyConfig = (): ShopifyConfig => {
  const shopName = process.env.SHOPIFY_SHOP_NAME;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

  if (!shopName || !accessToken) {
    throw new Error('Faltan variables de entorno de Shopify');
  }

  return {
    shopName,
    accessToken,
    apiVersion,
    baseUrl: `https://${shopName}.myshopify.com/admin/api/${apiVersion}`,
  };
};

// Cliente Shopify usando GraphQL - Implementa IShopifyClient (DIP)
export class ShopifyGraphQLClient implements IShopifyClient {
  private readonly config: ShopifyConfig;

  constructor(config: ShopifyConfig) {
    this.config = config;
  }

  async request<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.config.baseUrl}/graphql.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.config.accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en request Shopify: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as T;
    return data;
  }
}