import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Configuración
import { getShopifyConfig, ShopifyGraphQLClient } from './config/shopify.config';

// Servicios
import {
  ProductService,
  VariantService,
  OrderService,
  ImageService,
  LocationService,
} from './services';

// Controladores
import {
  ProductController,
  VariantController,
  OrderController,
  ImageController,
  LocationController,
} from './controllers';

// Rutas
import {
  createProductRoutes,
  createVariantRoutes,
  createOrderRoutes,
  createImageRoutes,
  createLocationRoutes,
} from './routes';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Cargar variables de entorno
dotenv.config();

// ============================================
// CONTENEDOR DE DEPENDENCIAS (DIP)
// ============================================
class DependencyContainer {
  // Cliente Shopify
  public readonly shopifyClient = new ShopifyGraphQLClient(getShopifyConfig());

  // Servicios
  public readonly productService = new ProductService(this.shopifyClient);
  public readonly variantService = new VariantService(this.shopifyClient);
  public readonly orderService = new OrderService(this.shopifyClient);
  public readonly imageService = new ImageService(this.shopifyClient);
  public readonly locationService = new LocationService(this.shopifyClient);

  // Controladores
  public readonly productController = new ProductController(
    this.productService
  );
  public readonly variantController = new VariantController(
    this.variantService
  );
  public readonly orderController = new OrderController(this.orderService);
  public readonly imageController = new ImageController(this.imageService);
  public readonly locationController = new LocationController(
    this.locationService
  );
}

// ============================================
// FACTORY FUNCTION PARA CREAR LA APP
// ============================================
export const createApp = (): Application => {
  const app = express();
  const container = new DependencyContainer();

  // Middleware de seguridad
  app.use(helmet());

  // Middleware CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Middleware para parsear JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ============================================
  // RUTAS
  // ============================================

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
    });
  });

  // Orders
  app.use(
    '/orders',
    createOrderRoutes(container.orderController)
  );

  // Order products
  app.use(
    '/order/products',
    createOrderRoutes(container.orderController)
  );

  // Products
  app.use(
    '/products',
    createProductRoutes(container.productController)
  );

  // Product
  app.use(
    '/product',
    createProductRoutes(container.productController)
  );

  // Product Variants
  app.use(
    '/product/variants',
    createVariantRoutes(container.variantController)
  );

  // Product Variant
  app.use(
    '/product/variant',
    createVariantRoutes(container.variantController)
  );

  // Product Images
  app.use(
    '/product/images',
    createImageRoutes(container.imageController)
  );

  // Locations
  app.use(
    '/locations',
    createLocationRoutes(container.locationController)
  );

  // ============================================
  // MIDDLEWARE DE ERRORES
  // ============================================
  
  // Ruta no encontrada
  app.use(notFoundHandler);

  // Manejador de errores
  app.use(errorHandler);

  return app;
};