import { z } from 'zod';

const variantOptionValueSchema = z.object({
  optionName: z.string().min(1, 'El nombre de la opción es requerido'),
  name: z.string().min(1, 'El valor de la opción es requerido'),
});

const productOptionValueSchema = z.object({
  name: z.string().min(1, 'El nombre del valor de opción es requerido'),
});

const productOptionSchema = z.object({
  name: z.string().min(1, 'El nombre de la opción es requerido'),
  values: z.array(productOptionValueSchema).min(1, 'Al menos un valor de opción es requerido'),
});

export const createVariantSchema = z.object({
  title: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio debe ser un número válido'),
  compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  inventoryQuantity: z.number().int().min(0).optional(),
  locationId: z.string().optional(),
  optionValues: z.array(variantOptionValueSchema).optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  options: z.array(productOptionSchema).optional(),
  variants: z.array(createVariantSchema).min(1, 'Al menos una variante es requerida'),
  publishToPublications: z.boolean().optional(),
  publicationIds: z.array(z.string()).optional(),
});

// Esquema para actualizar producto
export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
});

// Esquema para actualizar variante
export const updateVariantSchema = z.object({
  title: z.string().min(1).optional(),
  sku: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  inventoryQuantity: z.number().int().min(0).optional(),
  locationId: z.string().optional(),
});

// Esquema para actualización masiva de precios
export const bulkPriceUpdateSchema = z.object({
  updates: z.array(z.object({
    shopifyId: z.string().min(1, 'Shopify ID es requerido'),
    shopifyVariantId: z.string().min(1, 'Shopify Variant ID es requerido'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio debe ser un número válido'),
    compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  })).min(1, 'Al menos una actualización es requerida'),
});

// Esquema para crear imagen
export const createImageSchema = z.object({
  src: z.string().url('La URL de la imagen debe ser válida'),
  altText: z.string().optional(),
  variantId: z.string().optional(),
});

// Tipos inferidos de los esquemas
export const inventoryVariantUpdateSchema = z.object({
  shopifyVariantId: z.string().min(1, 'Shopify Variant ID es requerido'),
  inventoryQuantity: z.number().int().min(0, 'Cantidad de inventario debe ser >= 0'),
  locationId: z.string().min(1, 'Location ID es requerido'),
});

export const bulkInventoryUpdateSchema = z.object({
  updates: z.array(inventoryVariantUpdateSchema).min(1, 'Al menos una actualización es requerida'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;
export type BulkInventoryUpdateInput = z.infer<typeof bulkInventoryUpdateSchema>;
export type CreateImageInput = z.infer<typeof createImageSchema>;