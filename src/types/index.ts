// ============================================
// TIPOS BASE Y ENUMERACIONES
// ============================================

export interface ShopifyResponse<T> {
  data: T;
  errors?: ShopifyError[];
}

export interface ShopifyError {
  message: string;
  extensions?: {
    code: string;
  };
}

// ============================================
// PRODUCTOS
// ============================================

export interface Product {
  id: string;
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status: ProductStatus;
  publishedAt?: string;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
  resourcePublications?: ResourcePublication[];
}

export interface ResourcePublication {
  id: string;
  publication: {
    id: string;
    name: string;
  };
  publishedAt?: string;
}

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface CreateProductInput {
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  options?: ProductOptionInput[];
  variants?: CreateVariantInput[];
  publishToPublications?: boolean;
  publicationIds?: string[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: ProductStatus;
}

// ============================================
// VARIANTES
// ============================================

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  sku?: string;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity?: number;
  inventoryItemId?: string;
  locationId?: string;
  options?: VariantOption[];
  imageId?: string;
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface CreateVariantInput {
  title?: string;
  sku?: string;
  price: string;
  compareAtPrice?: string;
  inventoryQuantity?: number;
  locationId?: string;
  optionValues?: VariantOptionValueInput[];
}

export interface VariantOptionValueInput {
  optionName: string;
  name: string;
}

export interface ProductOptionInput {
  name: string;
  values: ProductOptionValueInput[];
}

export interface ProductOptionValueInput {
  name: string;
}

export interface UpdateVariantInput {
  productId?: string;
  title?: string;
  sku?: string;
  price?: string;
  compareAtPrice?: string;
  inventoryQuantity?: number;
  locationId?: string;
}

export interface VariantBulkUpdateInput {
  id: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
}

export interface VariantDeleteInput {
  id: string;
}

export interface DeleteVariantPayload {
  productId: string;
  variants: VariantDeleteInput[];
}

export interface VariantImageInput {
  id: string;
  image: string;
}

export interface VariantOptionValueInput {
  optionName: string;
  name: string;
}

export interface CreateVariantForProductInput {
  price: string;
  sku?: string;
  compareAtPrice?: string;
  inventoryQuantity?: number;
  locationId?: string;
  optionValues?: VariantOptionValueInput[];
}

export interface AddVariantsPayload {
  productId: string;
  variants: CreateVariantForProductInput[];
}

export interface UpdateVariantImagesInput {
  productId: string;
  variants: VariantImageInput[];
}

export interface BulkPriceUpdateInput {
  shopifyId: string;
  shopifyVariantId: string;
  price: string;
  compareAtPrice?: string;
}

// ============================================
// IMÁGENES
// ============================================

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
}

export interface CreateImageInput {
  src: string;
  altText?: string;
  variantId?: string;
}

// ============================================
// ÓRDENES
// ============================================

export interface Order {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  financialStatus: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currencyCode: string;
  lineItems: LineItem[];
}

export type OrderFinancialStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'VOIDED';

export type OrderFulfillmentStatus =
  | 'PENDING'
  | 'OPEN'
  | 'SUCCESS'
  | 'CANCELLED'
  | 'ERROR'
  | 'FAILURE';

export interface LineItem {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  variant?: ProductVariant;
  product?: Product;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// ============================================
// LOCACIONES
// ============================================

export interface Location {
  id: string;
  name: string;
  address?: LocationAddress;
  isActive: boolean;
}

export interface LocationAddress {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}

// ============================================
// PUBLICACIONES
// ============================================

export interface Publication {
  id: string;
  name: string;
  catalog?: PublicationCatalog;
  supportsFuturePublishing: boolean;
}

export interface PublicationCatalog {
  id: string;
  title: string;
}

// ============================================
// INTERFACES DE SERVICIOS (DIP)
// ============================================

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ProductPage {
  products: Product[];
  pageInfo: PageInfo;
}

export interface UpdateVariantPayload {
  productId: string;
  variants: VariantBulkUpdateInput[];
}

export interface IProductService {
  getAllProducts(): Promise<Product[]>;
  getProductsPage(first: number, after?: string): Promise<ProductPage>;
  getProductById(productId: string): Promise<Product | null>;
  createProduct(input: CreateProductInput): Promise<string>;
  updateProduct(productId: string, input: UpdateProductInput): Promise<void>;
  updateVariant(payload: UpdateVariantPayload): Promise<void>;
  updateVariantImages(input: UpdateVariantImagesInput): Promise<void>;
  addVariants(payload: AddVariantsPayload): Promise<void>;
  deleteVariant(payload: DeleteVariantPayload): Promise<void>;
  deleteProduct(productId: string): Promise<void>;
}

export interface IVariantService {
  getVariantsByProductId(productId: string): Promise<ProductVariant[]>;
  getVariantById(variantId: string): Promise<ProductVariant | null>;
  createVariant(productId: string, input: CreateVariantInput): Promise<string>;
  updateVariant(variantId: string, input: UpdateVariantInput): Promise<void>;
  deleteVariant(variantId: string): Promise<void>;
  bulkUpdatePrices(updates: BulkPriceUpdateInput[]): Promise<void>;
}

export interface InventoryVariantUpdate {
  shopifyVariantId: string;
  inventoryQuantity: number;
  locationId: string;
}

export interface InventoryProductUpdate {
  productId: string;
  variants: InventoryVariantUpdate[];
}

export interface PriceVariantUpdate {
  shopifyVariantId: string;
  price: string;
  compareAtPrice?: string;
}

export interface PriceProductUpdate {
  productId: string;
  variants: PriceVariantUpdate[];
}

export interface IInventoryService {
  listProductsInventory(first?: number, after?: string): Promise<ProductPage>;
  showProductInventory(productId: string): Promise<Product | null>;
  updateProductInventory(productId: string, update: InventoryProductUpdate): Promise<void>;
  updateProductPrices(productId: string, update: PriceProductUpdate): Promise<void>;
  listVariantsInventory(productId: string): Promise<ProductVariant[]>;
  showVariantInventory(variantId: string): Promise<ProductVariant | null>;
  updateVariantInventory(update: InventoryVariantUpdate): Promise<void>;
  bulkUpdateVariantsInventory(updates: InventoryVariantUpdate[]): Promise<void>;
}

export interface IOrderService {
  getAllOrders(): Promise<Order[]>;
  getOrderProducts(orderId: string): Promise<LineItem[]>;
}

export interface IImageService {
  getImagesByProductId(productId: string): Promise<ProductImage[]>;
  addImageToVariant(
    productId: string,
    variantId: string,
    input: CreateImageInput
  ): Promise<string>;
}

export interface ILocationService {
  getAllLocations(): Promise<Location[]>;
}

export interface IPublicationService {
  getAllPublications(): Promise<Publication[]>;
}

export interface IShopifyClient {
  request<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
}