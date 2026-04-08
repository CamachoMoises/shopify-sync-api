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


# API Routes

## Products (`/product`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | List all products |
| GET | /product/:product_id | Get product details |
| POST | /product/create | Create product |
| PUT | /product/update/:product_id | Update product |
| PUT | /product/delete/:product_id | Deactivate product |
| POST | /product/edit | Edit product |
| POST | /product/delete | Delete product |
| POST | /product/variants | Add variants |
| PUT | /product/variants | Update variants |
| DELETE | /product/variants | Delete variants |
| POST | /product/variants/images | Update variant images |

## Variants (`/product/variant`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /product/variants/:product_id | List product variants |
| POST | /product/variant/create | Create variant |
| POST | /product/variant/create/:producto_id | Create variant for product |
| PUT | /product/variant/update/:shopify_variant_id | Update variant |
| PUT | /product/variant/delete/:shopify_variant_id | Deactivate variant |

## Images (`/product/images`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /product/images/:product_id | List product images |
| POST | /product/images/add/:product_id/:shopify_variant_id | Add image to variant |

## Inventory (`/inventory`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /inventory/products | List products with inventory |
| GET | /inventory/products/:product_id | Get product inventory |
| PUT | /inventory/products/variants | Update product inventory |
| PUT | /inventory/products/prices | Update product prices |
| GET | /inventory/variants/:product_id | List variants inventory |
| GET | /inventory/variant/:variant_id | Get variant inventory |
| PUT | /inventory/variant/:variant_id | Update variant inventory |
| POST | /inventory/variants/bulk-update | Bulk update inventory |

## Orders (`/order`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders | Sync orders from Shopify |
| GET | /order/products/:order_id | Get order products |

## Locations (`/locations`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /locations | List locations |

## Publications (`/publications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /publications | List publications |


# Documentación de la API - Gestión de Ubicaciones

Esta documentación detalla los endpoints disponibles para la aplicación de gestión de inventario y ubicaciones.

---

## 1. Ubicaciones (Locations)

### Obtener todas las ubicaciones
Retorna una lista de todas las ubicaciones físicas vinculadas a la cuenta (basado en el esquema de Shopify).

* **URL:** `/locations`
* **Método:** `GET`
* **Autenticación:** Requerida (Bearer Token)
* **Parámetros de consulta:** Ninguno

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Indica si la petición fue procesada correctamente. |
| `data` | Array | Lista de objetos de ubicación. |
| `count` | Integer | Cantidad total de ubicaciones devueltas. |

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": [
        {
            "id": "gid://shopify/Location/81549426943",
            "name": "Hotel Tamanaco",
            "address": {
                "address1": "Hotel Tamanaco. Urbanización Las Mercedes",
                "address2": "PB - Tienda Joy",
                "city": "Baruta",
                "province": "Miranda",
                "country": "Venezuela",
                "zip": "1060",
                "phone": "+584241112233"
            },
            "isActive": true
        }
    ],
    "count": 1
}
```
---

## 2. Publicaciones (Publications)

### Listar Canales de Publicación
Obtiene los diferentes canales de venta o plataformas (Marketplaces, POS, Tienda Online) donde los productos pueden ser publicados.

* **URL:** `/publications`
* **Método:** `GET`
* **Autenticación:** Requerida (Bearer Token)
* **Parámetros de consulta:** Ninguno

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Confirmación del éxito de la consulta. |
| `data` | Array | Objetos que representan canales de venta (Shopify Publications). |
| `count` | Integer | Total de canales de publicación disponibles. |

**Atributos de la Publicación:**
* `id`: Identificador único global (GID) del canal.
* `name`: Nombre descriptivo de la plataforma (ej. Online Store, POS).
* `supportsFuturePublishing`: Booleano que indica si el canal permite programar publicaciones para fechas futuras.

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": [
        {
            "id": "gid://shopify/Publication/154542309631",
            "name": "Online Store",
            "supportsFuturePublishing": true
        },
        {
            "id": "gid://shopify/Publication/154542375167",
            "name": "Point of Sale",
            "supportsFuturePublishing": false
        },
        {
            "id": "gid://shopify/Publication/173766803711",
            "name": "Google & YouTube",
            "supportsFuturePublishing": true
        },
        {
            "id": "gid://shopify/Publication/177314267391",
            "name": "Facebook & Instagram",
            "supportsFuturePublishing": false
        }
    ],
    "count": 4
}
```



---

## 3. Productos (Products)

### Listar Productos (Paginado)
Obtiene una lista detallada de productos, incluyendo sus variantes, imágenes y los canales donde están publicados. Utiliza paginación hacia adelante mediante cursores.

* **URL:** `/products`
* **Método:** `GET`
* **Autenticación:** Requerida (Bearer Token)

#### Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `first` | Integer | No | Cantidad de registros a recuperar (ej. `20`). |
| `after` | String | No | Cursor para obtener la siguiente página (`endCursor` de la respuesta anterior). |

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Confirmación de la consulta. |
| `data` | Array | Lista de objetos de producto con sus variantes e imágenes. |
| `count` | Integer | Cantidad de productos en la respuesta actual. |
| `pageInfo` | Object | Información de paginación (`hasNextPage`, `endCursor`). |

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": [
        {
            "id": "gid://shopify/Product/9255396049151",
            "title": "Gargola Iluminada",
            "description": "• Aterradora gárgola en tono gris...",
            "vendor": "JOY Arte y Decoración",
            "tags": ["Figuras", "Halloween"],
            "status": "ACTIVE",
            "createdAt": "2025-11-05T18:43:56Z",
            "updatedAt": "2026-04-06T19:39:44Z",
            "variants": [
                {
                    "id": "gid://shopify/ProductVariant/47476606861567",
                    "price": "159.43",
                    "inventoryQuantity": 0,
                    "locationId": "gid://shopify/Location/81549426943"
                }
            ],
            "images": [
                {
                    "id": "gid://shopify/ProductImage/47059688751359",
                    "url": "[https://cdn.shopify.com/](https://cdn.shopify.com/)..."
                }
            ],
            "resourcePublications": [
                {
                    "publication": { "name": "Facebook & Instagram" },
                    "publishedAt": "2025-12-11T13:54:20Z"
                }
            ]
        }
    ],
    "count": 20,
    "pageInfo": {
        "hasNextPage": true,
        "endCursor": "eyJsYXN0X2lkIjo5MjU1NDAzOTEzNDcx..."
    }
}
```
---

## 4. Detalle de Producto (Product Detail)

### Obtener un producto por ID
Recupera la información completa de un producto específico utilizando su identificador único. Incluye detalles de variantes, inventario por ubicación y canales de publicación activos.

* **URL:** `/product/:product_id`
* **Método:** `GET`
* **Parámetros de URL:** * `product_id` (String): El GID o ID numérico del producto (ej: `gid://shopify/Product/9448497447167`).

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Confirmación de la consulta. |
| `data` | Object | Objeto con los detalles del producto. |
| `data.variants` | Array | Lista de opciones/modelos del producto (tallas, colores, etc). |
| `data.images` | Array | Galería de imágenes vinculadas. |

**Desglose de Variantes:**
Cada variante incluye `price` (precio actual), `compareAtPrice` (precio original/tachado si existe), `inventoryQuantity` (stock disponible) y el `sku` para gestión logística.

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": {
        "id": "gid://shopify/Product/9448497447167",
        "title": "Arbol 13",
        "vendor": "JOY Arte y Decoración",
        "productType": "Decoration",
        "status": "ACTIVE",
        "variants": [
            {
                "id": "gid://shopify/ProductVariant/48378060931327",
                "title": "150cm",
                "sku": "TREE-150",
                "price": "89.99",
                "compareAtPrice": "99.99",
                "inventoryQuantity": 52,
                "locationId": "gid://shopify/Location/81549426943"
            }
        ],
        "images": [
            {
                "id": "gid://shopify/ProductImage/48159381815551",
                "url": "[https://cdn.shopify.com/](https://cdn.shopify.com/)..."
            }
        ],
        "resourcePublications": [
            {
                "publication": { "name": "Online Store" },
                "publishedAt": "2026-04-07T16:09:47Z"
            }
        ]
    }
}
```
---

## 5. Productos Simplificados (Simple Products)

### Obtener listado ligero (Sincronización)
Retorna todos los productos y sus variantes con la información mínima necesaria (IDs y SKUs). Este endpoint no está paginado y está diseñado para operaciones de indexación rápida o validaciones de inventario masivas.

* **URL:** `/products/simple`
* **Método:** `GET`
* **Autenticación:** Requerida (Bearer Token)
* **Parámetros de consulta:** Ninguno

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Confirmación de la consulta. |
| `data` | Array | Lista simplificada de productos. |
| `count` | Integer | Total de productos devueltos (ej. `3018`). |

**Estructura de `data`:**
* `productId`: ID único del producto.
* `variants`: Array con `variantId`, `sku` y `locations` (ubicaciones).

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": [
        {
            "productId": "gid://shopify/Product/9255392477439",
            "variants": [
                {
                    "variantId": "gid://shopify/ProductVariant/47476595687679",
                    "sku": "020402010003",
                    "locations": [
                        {
                            "id": "gid://shopify/Location/81549426943"
                        }
                    ]
                }
            ]
        }
    ],
    "count": 3018
}
```
---

## 6. Órdenes (Orders)

### Listar Órdenes (Paginado)
Recupera un listado histórico de los pedidos realizados, incluyendo su estado financiero, de cumplimiento y el desglose de artículos comprados (`lineItems`).

* **URL:** `/orders`
* **Método:** `GET`
* **Autenticación:** Requerida (Bearer Token)

#### Parámetros de Consulta (Query Params)

| Parámetro | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `first` | Integer | No | Cantidad de órdenes a recuperar (ej. `20`). |
| `after` | String | No | Cursor para obtener la siguiente página (`endCursor`). |

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Confirmación de la consulta. |
| `data` | Array | Lista de objetos de órdenes. |
| `count` | Integer | Cantidad de registros en la página actual. |
| `pageInfo` | Object | Datos para navegación (`hasNextPage`, `endCursor`). |

**Estados Principales:**
* `financialStatus`: Estado del pago (ej: `VOIDED`, `PAID`, `PENDING`).
* `fulfillmentStatus`: Estado del envío (ej: `UNFULFILLED`, `FULFILLED`).

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": [
        {
            "id": "gid://shopify/Order/6479207235839",
            "name": "#1127",
            "createdAt": "2025-11-26T02:43:52Z",
            "financialStatus": "VOIDED",
            "fulfillmentStatus": "UNFULFILLED",
            "totalPrice": "142.61",
            "currencyCode": "USD",
            "lineItems": [
                {
                    "id": "gid://shopify/LineItem/15858505154815",
                    "title": "Tambor Set - 4",
                    "quantity": 1,
                    "price": "122.94",
                    "variant": {
                        "sku": "010402010449",
                        "price": "164.55"
                    }
                }
            ]
        }
    ],
    "count": 20,
    "pageInfo": {
        "hasNextPage": true,
        "endCursor": "eyJsYXN0X2lkIjo2NDgxMDAx..."
    }
}
```
---

## 7. Productos de una Orden (Order Line Items)

### Listar productos específicos de una orden
Obtiene el desglose detallado de los artículos (`LineItems`) incluidos en un pedido específico. A diferencia del listado general de órdenes, este endpoint se enfoca exclusivamente en la relación producto-variante comprada.

* **URL:** `/order/products/:order_id`
* **Método:** `GET`
* **Autenticación:** Requerida (Bearer Token)
* **Parámetros de URL:** * `order_id` (String): El identificador único de la orden (ej: `gid://shopify/Order/6479207235839`).

#### Respuesta Exitosa (200 OK)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `success` | Boolean | Confirmación de la consulta. |
| `data` | Array | Lista de artículos (`LineItems`) en la orden. |
| `count` | Integer | Total de artículos diferentes en el pedido. |

**Atributos del artículo:**
* `quantity`: Cantidad de unidades compradas de esa variante.
* `price`: Precio unitario al que se vendió en esa orden específica.
* `variant`: Detalles técnicos de la variante (SKU, ID).
* `product`: Información básica del producto padre.

**Ejemplo de cuerpo de respuesta:**

```json
{
    "success": true,
    "data": [
        {
            "id": "gid://shopify/LineItem/15858505154815",
            "title": "Tambor Set - 4",
            "variantTitle": "28cm",
            "quantity": 1,
            "price": "122.94",
            "variant": {
                "id": "gid://shopify/ProductVariant/47477519253759",
                "sku": "010402010449",
                "price": "164.55"
            },
            "product": {
                "id": "gid://shopify/Product/9255813480703",
                "title": "Tambor Set - 4",
                "status": "ACTIVE"
            }
        }
    ],
    "count": 1
}
```
---

## 8. Crear Producto (Create Product)

### Crear un nuevo producto con variantes
Envía la información necesaria para dar de alta un producto en el sistema. Este endpoint gestiona la creación del producto padre, sus opciones (tallas, colores), las variantes físicas con su stock inicial y la visibilidad en los canales de venta.

* **URL:** `/products/create`
* **Método:** `POST`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `title` | String | Sí | Nombre del producto. |
| `options` | Array | Sí | Define las dimensiones del producto (ej. Size, Color). |
| `variants` | Array | Sí | Lista de artículos físicos con SKU, precio y stock. |
| `publishToPublications` | Boolean | No | Si se debe publicar inmediatamente. |
| `publicationIds` | Array | No | IDs de los canales donde se hará visible. |

**Ejemplo de solicitud:**

```json
{
  "title": "Arbol 14",
  "description": "<p>Descripción en HTML...</p>",
  "vendor": "JOY Arte y Decoración",
  "productType": "Decoration",
  "tags": ["christmas", "madrid"],
  "options": [
    {
      "name": "Size",
      "values": [{ "name": "150cm" }, { "name": "180cm" }]
    }
  ],
  "variants": [
    {
      "price": "89.99",
      "sku": "TREE-150",
      "inventoryQuantity": 10,
      "locationId": "gid://shopify/Location/81549426943",
      "optionValues": [{ "optionName": "Size", "name": "150cm" }]
    }
  ],
  "publishToPublications": true,
  "publicationIds": ["gid://shopify/Publication/154542309631"]
}
```
---

## 9. Añadir Variantes (Add Product Variants)

### Agregar nuevas variantes a un producto existente
Permite insertar una o varias variantes adicionales a un producto ya creado. Es útil para añadir nuevos SKUs, tallas o modelos a una entidad de producto base.

* **URL:** `/product/variants`
* **Método:** `POST`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID del producto al que se le añadirán las variantes. |
| `variants` | Array | Sí | Lista de nuevas variantes a crear. |

**Atributos de la variante:**
* `price`: Precio de venta.
* `sku`: Código de referencia único para la nueva variante.
* `inventoryQuantity`: Stock inicial.
* `locationId`: ID de la ubicación donde se asignará el stock.
* `optionValues`: Referencia a las opciones existentes (ej. vincular con "Size").

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448497447167",
  "variants": [
    {
      "price": "59.99",
      "sku": "TREE-50",
      "compareAtPrice": "69.99",
      "inventoryQuantity": 10,
      "locationId": "gid://shopify/Location/81549426943",
      "optionValues": [
        { "optionName": "Size", "name": "50cm" }
      ]
    }
  ]
}
```
---

## 10. Imágenes de Variantes (Variant Images)

### Asociar imágenes a variantes específicas
Permite vincular URLs de imágenes externas con identificadores de variantes de producto. Este proceso asegura que el recurso visual esté correctamente mapeado a la opción elegida (ej. color o tamaño).

* **URL:** `/product/variants/images`
* **Método:** `POST`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID global del producto padre. |
| `variants` | Array | Sí | Lista de objetos con `id` (de la variante) e `image` (URL pública). |

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448497447167",
  "variants": [
    {
      "id": "gid://shopify/ProductVariant/48378060931327",
      "image": "[https://servidor.com/foto1.jpg](https://servidor.com/foto1.jpg)"
    },
    {
      "id": "gid://shopify/ProductVariant/48378060996863",
      "image": "[https://servidor.com/foto2.jpg](https://servidor.com/foto2.jpg)"
    }
  ]
}
```
---

## 11. Editar Producto (Update Product)

### Actualizar información base de un producto
Permite modificar los atributos generales de un producto existente, como su título, descripción, proveedor, tipo y etiquetas. Esta acción no afecta directamente a las variantes a menos que se realicen cambios estructurales.

* **URL:** `/product`
* **Método:** `PUT`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID global del producto a editar. |
| `title` | String | No | Nuevo nombre del producto. |
| `description` | String | No | Descripción en formato HTML. |
| `vendor` | String | No | Nombre del proveedor o marca. |
| `productType` | String | No | Categoría del producto. |
| `tags` | Array | No | Lista de etiquetas para filtrado y SEO. |

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448497447167",
  "title": "Arbol 100",
  "description": "<p>Product description........</p>",
  "vendor": "JOY Arte y Decoración",
  "productType": "Decoration",
  "tags": ["christmas", "Test"]
}
```
---

## 12. Editar Variantes (Update Product Variants)

### Actualizar datos de variantes existentes
Permite modificar atributos específicos de una o varias variantes pertenecientes a un producto, como el precio de venta, el precio de comparación (descuento) y el SKU.

* **URL:** `/product/variants`
* **Método:** `PUT`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID global del producto padre. |
| `variants` | Array | Sí | Lista de variantes a modificar. Cada objeto debe incluir su `id`. |

**Atributos editables por variante:**
* `id`: (Obligatorio) ID de la variante a editar.
* `price`: Nuevo precio de venta.
* `compareAtPrice`: Nuevo precio original (para mostrar ofertas).
* `sku`: Nuevo código de referencia.

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448497447167",
  "variants": [
    {
      "id": "gid://shopify/ProductVariant/48378904183039",
      "price": "95.00",
      "compareAtPrice": "109.99",
      "sku": "TREE-150-V2"
    },
    {
      "id": "gid://shopify/ProductVariant/48378060996863",
      "price": "115.00"
    }
  ]
}
```
---

## 13. Eliminar Producto (Delete Product)

### Eliminar un producto permanentemente
Remueve un producto y todas sus variantes asociadas del sistema. Esta acción es irreversible.

* **URL:** `/product`
* **Método:** `DELETE`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | El ID numérico o GID del producto a eliminar. |

**Ejemplo de solicitud:**

```json
{
  "productId": "9449019375871"
}
```
---

## 14. Eliminar Variantes (Delete Product Variants)

### Eliminar variantes específicas de un producto
Permite remover una o varias variantes de un producto existente. Es útil para limpiar SKUs obsoletos o descontinuados manteniendo la entidad del producto base.

* **URL:** `/product/variants`
* **Método:** `DELETE`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID global del producto padre. |
| `variants` | Array | Sí | Lista de objetos que contienen el `id` de las variantes a eliminar. |

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448452260095",
  "variants": [
    {
      "id": "gid://shopify/ProductVariant/48377647792383"
    }
  ]
}
```
---

## 15. Actualización Masiva de Precios (Inventory Prices)

### Actualizar precios de variantes desde inventario
Endpoint optimizado para la modificación rápida de precios y precios de comparación. A diferencia de la edición general de variantes, este se centra exclusivamente en la lógica comercial y de ofertas.

* **URL:** `/inventory/products/prices`
* **Método:** `PUT`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID global del producto padre. |
| `variants` | Array | Sí | Lista de variantes a las que se les ajustará el precio. |

**Atributos del objeto `variants`:**
* `shopifyVariantId`: (Obligatorio) ID global de la variante de Shopify.
* `price`: Nuevo precio de venta al público.
* `compareAtPrice`: Precio original (para mostrar descuentos).

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448497447167",
  "variants": [
    {
      "shopifyVariantId": "gid://shopify/ProductVariant/48378904183039",
      "price": "95.00",
      "compareAtPrice": "109.99"
    }
  ]
}
```

---

## 16. Actualización de Stock (Inventory Quantities)

### Actualizar cantidades de inventario por ubicación
Permite ajustar el stock disponible de múltiples variantes de forma simultánea. Es necesario especificar la ubicación (`locationId`) para que el sistema sepa qué almacén o tienda física debe actualizarse.

* **URL:** `/inventory/products/variants`
* **Método:** `PUT`
* **Autenticación:** Requerida (Bearer Token)
* **Content-Type:** `application/json`

#### Estructura del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `productId` | String | Sí | ID global del producto padre. |
| `variants` | Array | Sí | Lista de variantes a las que se les ajustará el stock. |

**Atributos del objeto `variants`:**
* `shopifyVariantId`: (Obligatorio) ID global de la variante.
* `inventoryQuantity`: Nueva cantidad física disponible.
* `locationId`: ID de la ubicación (tienda/almacén) donde reside el stock.

**Ejemplo de solicitud:**

```json
{
  "productId": "gid://shopify/Product/9448497447167",
  "variants": [
    {
      "shopifyVariantId": "gid://shopify/ProductVariant/48378904183039",
      "inventoryQuantity": 27,
      "locationId": "gid://shopify/Location/81549426943"
    },
    {
      "shopifyVariantId": "gid://shopify/ProductVariant/48378060996863",
      "inventoryQuantity": 33,
      "locationId": "gid://shopify/Location/81549426943"
    }
  ]
}
```

---
## Licencia

Este proyecto está bajo la Licencia Joy Arte y Decoraciones.