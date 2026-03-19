# Shopify Sync API

API RESTful diseñada para la sincronización de inventario con Shopify, construida con TypeScript, Node.js, Express y GraphQL. Implementa los principios SOLID y está diseñada para respetar los límites de rate limiting de Shopify.

## Descripción

Esta API RESTful facilita la gestión de productos, variantes, órdenes, imágenes y ubicaciones, proporcionando una interfaz robusta y escalable para interactuar con la plataforma Shopify. Su diseño se adhiere a los principios SOLID para garantizar mantenibilidad y extensibilidad.

## Características

- **Gestión Integral de Recursos Shopify**: Permite crear, actualizar, eliminar y consultar productos, variantes, órdenes, imágenes y ubicaciones.
- **Arquitectura SOLID**: Diseñada siguiendo los principios de Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation y Dependency Inversion para un código limpio y modular.
- **Desarrollo con TypeScript**: Utiliza TypeScript para tipado estático, mejorando la seguridad y la claridad del código.
- **Validación de Datos Robusta**: Implementa Zod para la validación de esquemas de entrada, asegurando la integridad de los datos.
- **Control de Tasa de Peticiones (Rate Limiting)**: Incorpora `express-rate-limit` con políticas diferenciadas para lecturas, escrituras y operaciones masivas, protegiendo la API y respetando los límites de Shopify.
- **Logging Estructurado**: Utiliza Winston para un registro de eventos configurable y estructurado.
- **Seguridad**: Incluye `helmet` para establecer cabeceras HTTP de seguridad y `cors` para la gestión de Cross-Origin Resource Sharing.

## Tecnologías Utilizadas

- **Node.js**
- **Express.js**: Framework web para la construcción de APIs.
- **TypeScript**: Lenguaje de programación.
- **Zod**: Biblioteca para la declaración y validación de esquemas.
- **Winston**: Biblioteca de logging.
- **Helmet**: Middleware de seguridad para Express.
- **CORS**: Middleware para habilitar Cross-Origin Resource Sharing.
- **Express-Rate-Limit**: Middleware para limitar peticiones HTTP.
- **Dotenv**: Para la gestión de variables de entorno.

## Arquitectura SOLID

Este proyecto sigue rigurosamente los principios SOLID para promover un diseño de software robusto y fácil de mantener:

-   **S - Single Responsibility Principle (SRP)**: Cada clase y módulo tiene una única razón para cambiar. Por ejemplo, `ProductService` se encarga exclusivamente de la lógica de negocio relacionada con productos, mientras que los controladores manejan únicamente las peticiones HTTP.
-   **O - Open/Closed Principle (OCP)**: Las entidades de software (clases, módulos, funciones, etc.) deben estar abiertas para extensión, pero cerradas para modificación. Las interfaces (`IShopifyClient`, `IProductService`) permiten añadir nuevas funcionalidades sin alterar el código existente.
-   **L - Liskov Substitution Principle (LSP)**: Los objetos de un programa deben ser reemplazables por instancias de sus subtipos sin alterar la corrección de ese programa. `ShopifyGraphQLClient` implementa `IShopifyClient`, permitiendo que cualquier cliente que implemente esta interfaz pueda ser utilizado indistintamente.
-   **I - Interface Segregation Principle (ISP)**: Los clientes no deben ser forzados a depender de interfaces que no utilizan. Se utilizan interfaces pequeñas y específicas como `IProductService`, `IVariantService`, `IOrderService`, etc.
-   **D - Dependency Inversion Principle (DIP)**: Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones. Las abstracciones no deben depender de los detalles; los detalles deben depender de las abstracciones. Los servicios dependen de `IShopifyClient` (una abstracción), no de `ShopifyGraphQLClient` (una concreción), y los controladores dependen de interfaces de servicios.

## Estructura del Proyecto

```
src/
├── config/           # Configuración de la aplicación (Shopify, Logger)
├── controllers/      # Manejadores de las peticiones HTTP
├── middleware/       # Middleware de Express (validación, rate limiting, manejo de errores)
├── routes/           # Definición de las rutas de la API
├── services/         # Lógica de negocio y comunicación con la API de Shopify
├── types/            # Definiciones de interfaces y tipos de TypeScript
├── validators/       # Esquemas de validación de datos con Zod
├── app.ts            # Configuración principal de Express y contenedor de inyección de dependencias
└── server.ts         # Punto de entrada de la aplicación
```

## Instalación

Para configurar y ejecutar el proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio**:

    ```bash
    git clone https://github.com/CamachoMoises/shopify-sync-api.git
    cd shopify-sync-api
    ```

2.  **Instalar dependencias**:

    ```bash
    npm install
    ```

## Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno. Puedes usar `.env.example` como plantilla.

```env
# Configuración de la API de Shopify
SHOPIFY_SHOP_NAME=tu-tienda
SHOPIFY_ACCESS_TOKEN=tu-access-token
SHOPIFY_API_VERSION=2024-01

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Rate Limiting (límites de la API de Shopify)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de Logging
LOG_LEVEL=info
```

-   `SHOPIFY_SHOP_NAME`: El nombre de tu tienda Shopify (ej. `mi-tienda`).
-   `SHOPIFY_ACCESS_TOKEN`: Un token de acceso de la API de Shopify con los permisos necesarios.
-   `SHOPIFY_API_VERSION`: La versión de la API de Shopify a utilizar (por defecto: `2024-01`).
-   `PORT`: Puerto en el que se ejecutará la API (por defecto: `3000`).
-   `NODE_ENV`: Entorno de ejecución (`development` o `production`).
-   `RATE_LIMIT_WINDOW_MS`: Ventana de tiempo para el rate limiting en milisegundos (por defecto: `60000` ms = 1 minuto).
-   `RATE_LIMIT_MAX_REQUESTS`: Número máximo de peticiones permitidas dentro de la ventana de tiempo (por defecto: `100`).
-   `LOG_LEVEL`: Nivel de logging (ej. `info`, `debug`, `error`).

## Ejecución

-   **Modo Desarrollo**:

    ```bash
    npm run dev
    ```

-   **Modo Producción**:

    ```bash
    npm run build
    npm start
    ```

La API estará disponible en `http://localhost:PORT` (ej. `http://localhost:3000`).

## Endpoints de la API

La API expone los siguientes grupos de endpoints:

### Health Check

-   `GET /health`
    -   **Descripción**: Verifica el estado de la API.
    -   **Respuesta Exitosa**: `HTTP 200 OK`
    ```json
    {
      "success": true,
      "message": "API funcionando correctamente",
      "timestamp": "2023-10-27T10:00:00.000Z"
    }
    ```

### Productos

Base URL: `/product`

-   `GET /products`
    -   **Descripción**: Obtiene una lista de todos los productos de Shopify.
    -   **Rate Limit**: `apiRateLimiter`

-   `GET /product/:product_id`
    -   **Descripción**: Obtiene los detalles de un producto específico por su ID de Shopify.
    -   **Parámetros**: `product_id` (path) - ID del producto en Shopify.
    -   **Rate Limit**: `apiRateLimiter`

-   `POST /product/create`
    -   **Descripción**: Crea un nuevo producto en Shopify. Requiere al menos una variante.
    -   **Rate Limit**: `writeRateLimiter`
    -   **Validación**: `createProductSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "title": "Nuevo Producto Ejemplo",
          "description": "Descripción detallada del nuevo producto.",
          "vendor": "Mi Marca",
          "productType": "Electrónica",
          "tags": ["nuevo", "oferta"],
          "variants": [
            {
              "title": "Variante Roja",
              "price": "19.99",
              "sku": "NP-001-ROJO",
              "inventoryQuantity": 10,
              "options": [
                { "name": "Color", "value": "Rojo" }
              ]
            },
            {
              "title": "Variante Azul",
              "price": "21.99",
              "sku": "NP-001-AZUL",
              "inventoryQuantity": 15,
              "options": [
                { "name": "Color", "value": "Azul" }
              ]
            }
          ]
        }
        ```

-   `PUT /product/update/:product_id`
    -   **Descripción**: Actualiza un producto existente en Shopify.
    -   **Parámetros**: `product_id` (path) - ID del producto en Shopify.
    -   **Rate Limit**: `writeRateLimiter`
    -   **Validación**: `updateProductSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "title": "Producto Ejemplo Actualizado",
          "status": "DRAFT"
        }
        ```

-   `PUT /product/delete/:product_id`
    -   **Descripción**: Desactiva (archiva) un producto en Shopify.
    -   **Parámetros**: `product_id` (path) - ID del producto en Shopify.
    -   **Rate Limit**: `writeRateLimiter`

### Variantes

Base URL: `/product/variant`

-   `GET /product/variants/:product_id`
    -   **Descripción**: Obtiene todas las variantes para un producto específico.
    -   **Parámetros**: `product_id` (path) - ID del producto en Shopify.
    -   **Rate Limit**: `apiRateLimiter`

-   `POST /product/variant/create`
    -   **Descripción**: Crea una nueva variante de producto. El `productId` debe ir en el cuerpo de la petición.
    -   **Rate Limit**: `writeRateLimiter`
    -   **Validación**: `createVariantSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "productId": "gid://shopify/Product/1234567890",
          "title": "Variante Verde",
          "price": "22.50",
          "sku": "NP-001-VERDE",
          "inventoryQuantity": 5,
          "options": [
            { "name": "Color", "value": "Verde" }
          ]
        }
        ```

-   `POST /product/variant/create/:producto_id`
    -   **Descripción**: Crea una nueva variante para un producto específico, utilizando el `product_id` de la URL.
    -   **Parámetros**: `producto_id` (path) - ID del producto en Shopify.
    -   **Rate Limit**: `writeRateLimiter`
    -   **Validación**: `createVariantSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "title": "Variante Amarilla",
          "price": "20.00",
          "sku": "NP-001-AMARILLO",
          "inventoryQuantity": 8,
          "options": [
            { "name": "Color", "value": "Amarillo" }
          ]
        }
        ```

-   `PUT /product/variant/update/:shopify_variant_id`
    -   **Descripción**: Actualiza una variante existente por su ID de Shopify.
    -   **Parámetros**: `shopify_variant_id` (path) - ID de la variante en Shopify.
    -   **Rate Limit**: `writeRateLimiter`
    -   **Validación**: `updateVariantSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "price": "25.00",
          "inventoryQuantity": 20
        }
        ```

-   `PUT /product/variant/delete/:shopify_variant_id`
    -   **Descripción**: Desactiva una variante de producto por su ID de Shopify.
    -   **Parámetros**: `shopify_variant_id` (path) - ID de la variante en Shopify.
    -   **Rate Limit**: `writeRateLimiter`

-   `POST /product/variants/update/price`
    -   **Descripción**: Realiza una actualización masiva de precios para múltiples variantes.
    -   **Rate Limit**: `bulkRateLimiter`
    -   **Validación**: `bulkPriceUpdateSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "updates": [
            {
              "shopifyId": "gid://shopify/Product/1234567890",
              "shopifyVariantId": "gid://shopify/ProductVariant/9876543210",
              "price": "29.99"
            },
            {
              "shopifyId": "gid://shopify/Product/1234567891",
              "shopifyVariantId": "gid://shopify/ProductVariant/9876543211",
              "price": "15.50",
              "compareAtPrice": "18.00"
            }
          ]
        }
        ```

### Órdenes

Base URL: `/orders`

-   `GET /orders`
    -   **Descripción**: Obtiene una lista de todas las órdenes de Shopify.
    -   **Rate Limit**: `apiRateLimiter`

-   `GET /orders/products/:order_id`
    -   **Descripción**: Obtiene los productos asociados a una orden específica por su ID de Shopify.
    -   **Parámetros**: `order_id` (path) - ID de la orden en Shopify.
    -   **Rate Limit**: `apiRateLimiter`

### Imágenes

Base URL: `/product/images`

-   `GET /product/images/:product_id`
    -   **Descripción**: Obtiene una lista de imágenes para un producto específico.
    -   **Parámetros**: `product_id` (path) - ID del producto en Shopify.
    -   **Rate Limit**: `apiRateLimiter`

-   `POST /product/images/add/:product_id/:shopify_variant_id`
    -   **Descripción**: Añade una imagen a un producto y la asocia a una variante específica.
    -   **Parámetros**: 
        -   `product_id` (path) - ID del producto en Shopify.
        -   `shopify_variant_id` (path) - ID de la variante en Shopify.
    -   **Rate Limit**: `writeRateLimiter`
    -   **Validación**: `createImageSchema`
    -   **Body Ejemplo**:
        ```json
        {
          "src": "https://example.com/image.jpg",
          "altText": "Imagen de ejemplo",
          "variantId": "gid://shopify/ProductVariant/9876543210"
        }
        ```

### Ubicaciones

Base URL: `/locations`

-   `GET /locations`
    -   **Descripción**: Obtiene una lista de todas las ubicaciones de inventario de Shopify.
    -   **Rate Limit**: `apiRateLimiter`

## Rate Limiting

La API implementa rate limiting para respetar los límites de la API de Shopify y prevenir abusos. Se utilizan tres tipos de limitadores:

-   **`apiRateLimiter` (Lectura)**: Configurable mediante `RATE_LIMIT_WINDOW_MS` y `RATE_LIMIT_MAX_REQUESTS` en el archivo `.env`. Por defecto, permite 100 peticiones por minuto.
-   **`writeRateLimiter` (Escritura)**: Limita las operaciones de escritura a 2 peticiones por segundo.
-   **`bulkRateLimiter` (Operaciones Masivas)**: Diseñado para operaciones de alto volumen como la actualización masiva de precios, limitando a 1 petición cada 10 segundos. Las operaciones masivas de precios se procesan internamente en lotes de 100 variantes con retrasos entre lotes para cumplir con los límites de Shopify.

## Validación

Todas las peticiones `POST` y `PUT` son validadas utilizando la biblioteca Zod antes de que la lógica de negocio sea ejecutada. Esto asegura que los datos de entrada cumplan con los formatos y requisitos esperados. Los esquemas de validación clave incluyen:

-   **`createProductSchema`**: Requiere un título y al menos una variante para la creación de productos.
-   **`updateProductSchema`**: Permite actualizar el título, descripción, vendedor, tipo de producto, etiquetas y estado (`ACTIVE`, `DRAFT`, `ARCHIVED`).
-   **`createVariantSchema`**: Requiere un título y un precio válido. Permite SKU, cantidad de inventario y opciones.
-   **`updateVariantSchema`**: Permite actualizar el título, SKU, precio y cantidad de inventario de una variante.
-   **`bulkPriceUpdateSchema`**: Para actualizaciones masivas de precios, requiere `shopifyId`, `shopifyVariantId` y un `price` válido para cada actualización.
-   **`createImageSchema`**: Requiere una URL de imagen válida (`src`).

En caso de fallar la validación, la API responderá con un estado `HTTP 400 Bad Request` y un objeto JSON detallando los errores.

## Logging

La API utiliza la biblioteca Winston para un logging estructurado y configurable. El nivel de logging se puede ajustar mediante la variable de entorno `LOG_LEVEL`.

-   En entornos de desarrollo, los logs son legibles y formateados para facilitar la depuración.
-   En entornos de producción, los logs se emiten en formato JSON, ideal para sistemas de monitoreo y análisis centralizados.
-   Todos los errores críticos y operaciones importantes son registrados para facilitar el seguimiento y la resolución de problemas.

## Scripts Disponibles

Los siguientes scripts están disponibles para facilitar el desarrollo y la gestión del proyecto:

-   `npm run dev`: Inicia la aplicación en modo desarrollo con `ts-node-dev`, incluyendo recarga en caliente (hot-reload).
-   `npm run build`: Compila el código TypeScript a JavaScript en el directorio `dist/`.
-   `npm start`: Ejecuta la aplicación compilada en modo producción.
-   `npm run lint`: Ejecuta ESLint para analizar el código fuente en busca de errores y problemas de estilo.
-   `npm run lint:fix`: Ejecuta ESLint y corrige automáticamente los problemas que pueden ser resueltos.
-   `npm run type-check`: Realiza una verificación de tipos con TypeScript sin compilar el código.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
