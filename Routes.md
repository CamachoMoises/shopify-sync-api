# Documentación de la API - Gestión de SHOPIFY

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