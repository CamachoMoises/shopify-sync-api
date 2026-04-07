import {
  IOrderService,
  IShopifyClient,
  Order,
  LineItem,
  ShopifyResponse
} from '../types';
import { logger } from '../config/logger.config';
import { ShopifyAPIError, NotFoundError } from '../middleware/error.middleware';

// Queries GraphQL
const GET_ORDERS_QUERY = `
  query GetOrders($first: Int!) {
    orders(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          updatedAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          subtotalPriceSet {
            shopMoney {
              amount
            }
          }
          totalTaxSet {
            shopMoney {
              amount
            }
          }
          currencyCode
          lineItems(first: 100) {
            edges {
              node {
                id
                title
                variantTitle
                quantity
                originalTotalSet {
                  shopMoney {
                    amount
                  }
                }
                variant {
                  id
                  title
                  sku
                  price
                }
                product {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_ORDER_PRODUCTS_QUERY = `
  query GetOrderProducts($orderId: ID!) {
    order(id: $orderId) {
      lineItems(first: 100) {
        edges {
          node {
            id
            title
            variantTitle
            quantity
            originalTotalSet {
              shopMoney {
                amount
              }
            }
            variant {
              id
              title
              sku
              price
            }
            product {
              id
              title
            }
          }
        }
      }
    }
  }
`;

interface OrdersData {
  orders: {
    edges: Array<{
      node: ShopifyOrderNode;
    }>;
  };
}

interface OrderProductsData {
  order: {
    lineItems: {
      edges: Array<{
        node: ShopifyLineItemNode;
      }>;
    };
  } | null;
}

interface ShopifyOrderNode {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  subtotalPriceSet: {
    shopMoney: {
      amount: string;
    };
  };
  totalTaxSet: {
    shopMoney: {
      amount: string;
    };
  };
  currencyCode: string;
  lineItems: {
    edges: Array<{
      node: ShopifyLineItemNode;
    }>;
  };
}

interface ShopifyLineItemNode {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  originalTotalSet: {
    shopMoney: {
      amount: string;
    };
  };
  variant: {
    id: string;
    title: string;
    sku: string | null;
    price: string;
  } | null;
  product: {
    id: string;
    title: string;
  } | null;
}

// Servicio de Órdenes - Implementa IOrderService (DIP + SRP)
export class OrderService implements IOrderService {
  constructor(private readonly shopifyClient: IShopifyClient) { }

  async getAllOrders(): Promise<Order[]> {
    try {
      console.log('Obteniendo todas las órdenes de Shopify');

      const response = await this.shopifyClient.request<
        ShopifyResponse<OrdersData>
      >(GET_ORDERS_QUERY, { first: 250 });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      const orders = response.data.orders.edges.map((edge) =>
        this.mapShopifyOrderToOrder(edge.node)
      );

      console.log(`Obtenidas ${orders.length} órdenes`);
      return orders;
    } catch (error) {
      console.error('Error obteniendo órdenes', { error });
      throw error;
    }
  }

  async getOrderProducts(orderId: string): Promise<LineItem[]> {
    try {
      console.log('Obteniendo productos de la orden', { orderId });

      const response = await this.shopifyClient.request<
        ShopifyResponse<OrderProductsData>
      >(GET_ORDER_PRODUCTS_QUERY, { orderId });

      if (response.errors && response.errors.length > 0) {
        throw new ShopifyAPIError(
          `Error de Shopify: ${response.errors[0].message}`
        );
      }

      if (!response.data.order) {
        throw new NotFoundError(`Orden ${orderId} no encontrada`);
      }

      const lineItems = response.data.order.lineItems.edges.map((edge) =>
        this.mapShopifyLineItemToLineItem(edge.node)
      );

      console.log(`Obtenidos ${lineItems.length} productos de la orden`, {
        orderId
      });
      return lineItems;
    } catch (error) {
      console.error('Error obteniendo productos de la orden', {
        orderId,
        error
      });
      throw error;
    }
  }

  private mapShopifyOrderToOrder(node: ShopifyOrderNode): Order {
    return {
      id: node.id,
      name: node.name,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      financialStatus: node.displayFinancialStatus as Order['financialStatus'],
      fulfillmentStatus: node.displayFulfillmentStatus as Order['fulfillmentStatus'],
      totalPrice: node.totalPriceSet.shopMoney.amount,
      subtotalPrice: node.subtotalPriceSet.shopMoney.amount,
      totalTax: node.totalTaxSet.shopMoney.amount,
      currencyCode: node.currencyCode,
      lineItems: node.lineItems.edges.map((edge) =>
        this.mapShopifyLineItemToLineItem(edge.node)
      ),
    };
  }

  private mapShopifyLineItemToLineItem(node: ShopifyLineItemNode): LineItem {
    return {
      id: node.id,
      title: node.title,
      variantTitle: node.variantTitle || undefined,
      quantity: node.quantity,
      price: node.originalTotalSet.shopMoney.amount,
      variant: node.variant
        ? {
          id: node.variant.id,
          productId: node.product?.id || '',
          title: node.variant.title,
          sku: node.variant.sku || undefined,
          price: node.variant.price,
        }
        : undefined,
      product: node.product
        ? {
          id: node.product.id,
          title: node.product.title,
          status: 'ACTIVE',
          variants: [],
          images: [],
        }
        : undefined,
    };
  }
}