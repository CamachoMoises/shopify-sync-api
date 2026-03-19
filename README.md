# Shopify Sync API

API RESTful para sincronización de inventario con Shopify, construida con TypeScript, Node.js, Express y GraphQL. Implementa los principios SOLID y está diseñada para respetar los límites de rate limiting de Shopify.

## 🏗️ Arquitectura SOLID

Este proyecto sigue los principios SOLID:

- **S - Single Responsibility Principle**: Cada clase tiene una única responsabilidad
  - `ProductService`: Solo maneja operaciones de productos
  - `VariantService`: Solo maneja operaciones de variantes
  - Cada controlador solo maneja HTTP requests

- **O - Open/Closed Principle**: Las clases están abiertas para extensión pero cerradas para modificación
  - Las interfaces permiten extender funcionalidad sin modificar código existente

- **L - Liskov Substitution Principle**: Las implementaciones pueden sustituir a las interfaces
  - `ShopifyGraphQLClient` implementa `IShopifyClient`
  - `ProductService` implementa `IProductService`

- **I - Interface Segregation Principle**: Interfaces pequeñas y específicas
  - `IProductService`, `IVariantService`, `IOrderService`, etc.

- **D - Dependency Inversion Principle**: Depender de abstracciones, no de concreciones
  - Los servicios dependen de `IShopifyClient`, no de `ShopifyGraphQLClient`
  - Los controladores dependen de interfaces de servicios

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración (Shopify, Logger)
├── controllers/      # Controladores HTTP
├── middleware/       # Middleware (validación, rate limiting, errores)
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio (comunicación con Shopify)
├── types/            # Interfaces y tipos TypeScript
├── validators/       # Esquemas de validación con Zod
├── app.ts            # Configuración de Express y DI Container
└── server.ts         # Punto de entrada
```

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd shopify-sync-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Shopify

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## ⚙️ Variables de Entorno

```env
# Shopify API Configuration
SHOPIFY_SHOP_NAME=tu-tienda
SHOPIFY_ACCESS_TOKEN=tu-access-token
SHOPIFY_API_VERSION=2024-01

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting (Shopify API Limits)
RATE_LIMIT_WINDOW_MS=1000
RATE_LIMIT_MAX_REQUESTS=2

# Logging
LOG_LEVEL=info
```

## 📡 Endpoints

### Health Check
- `GET /health` - Verificar estado de la API

### Órdenes
- `GET /orders` - Sincronizar órdenes desde Shopify
- `GET /order/products/:order_id` - Detalles de productos en una orden

### Productos
- `GET /products` - Lista de productos
- `GET /product/:product_id` - Detalles de un producto
- `POST /product/create` - Crear producto (requiere variantes)
- `PUT /product/update/:product_id` - Actualizar producto
- `PUT /product/delete/:product_id` - Desactivar producto

### Variantes
- `GET /product/variants/:product_id` - Lista de variantes de un producto
- `POST /product/variant/create` - Crear variante
- `POST /product/variant/create/:producto_id` - Crear variante para producto específico
- `PUT /product/variant/update/:shopify_variant_id` - Actualizar variante
- `PUT /product/variant/delete/:shopify_variant_id` - Desactivar variante
- `POST /product/variants/update/price` - Actualización masiva de precios

### Imágenes
- `GET /product/images/:product_id` - Lista de imágenes de un producto
- `POST /product/images/add/:product_id/:shopify_variant_id` - Agregar imagen a variante

### Locaciones
- `GET /locations` - Lista de locaciones

## 📋 Ejemplos de Uso

### Crear Producto
```bash
POST /product/create
{
  "title": "Camiseta Deportiva",
  "description": "Camiseta de alta calidad",
  "vendor": "Mi Marca",
  "productType": "Ropa",
  "tags": ["deportiva", "verano"],
  "variants": [
    {
      "title": "Rojo / M",
      "sku": "CAM-ROJ-M",
      "price": "29.99",
      "compareAtPrice": "39.99",
      "inventoryQuantity": 100,
      "options": [
        { "name": "Color", "value": "Rojo" },
        { "name": "Talla", "value": "M" }
      ]
    }
  ]
}
```

### Actualizar Producto
```bash
PUT /product/update/gid://shopify/Product/123456
{
  "title": "Nuevo Título",
  "status": "ACTIVE"
}
```

### Crear Variante
```bash
POST /product/variant/create/:producto_id
{
  "title": "Azul / L",
  "sku": "CAM-AZU-L",
  "price": "29.99",
  "inventoryQuantity": 50,
  "options": [
    { "name": "Color", "value": "Azul" },
    { "name": "Talla", "value": "L" }
  ]
}
```

### Actualizar Variante
```bash
PUT /product/variant/update/gid://shopify/ProductVariant/789012
{
  "price": "34.99",
  "sku": "CAM-ROJ-M-NEW"
}
```

### Actualización Masiva de Precios
```bash
POST /product/variants/update/price
{
  "updates": [
    {
      "shopifyId": "gid://shopify/Product/123456",
      "shopifyVariantId": "gid://shopify/ProductVariant/789012",
      "price": "24.99",
      "compareAtPrice": "34.99"
    },
    {
      "shopifyId": "gid://shopify/Product/123457",
      "shopifyVariantId": "gid://shopify/ProductVariant/789013",
      "price": "19.99"
    }
  ]
}
```

### Agregar Imagen a Variante
```bash
POST /product/images/add/gid://shopify/Product/123456/gid://shopify/ProductVariant/789012
{
  "src": "https://ejemplo.com/imagen.jpg",
  "altText": "Descripción de la imagen"
}
```

## 🛡️ Rate Limiting

La API implementa rate limiting para respetar los límites de Shopify:

- **Lectura**: 2 requests/segundo (configurable)
- **Escritura**: 2 requests/segundo
- **Operaciones masivas**: 1 request/10 segundos

Las operaciones masivas de precios se procesan en batches de 100 variantes con delays entre batches.

## ✅ Validación

Todas las peticiones POST y PUT son validadas con Zod antes de procesarse:

- **Productos**: Título requerido, al menos una variante
- **Variantes**: Título y precio requeridos
- **Imágenes**: URL válida requerida
- **Precios**: Formato numérico válido

## 📝 Logging

Se utiliza Winston para logging estructurado:

- Nivel configurable via `LOG_LEVEL`
- Formato JSON en producción
- Formato legible en desarrollo
- Todos los errores y operaciones importantes son logueados

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar en producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint
npm run type-check   # Verificar tipos sin compilar
```

## 📄 Licencia

MIT