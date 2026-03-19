import { z } from 'zod';

// Esquema para opciones de variante
const variantOptionSchema = z.object({
  name: z.string().min(1, 'El nombre de la opción es requerido'),
  value: z.string().min(1, 'El valor de la opción es requerido'),
});

// Esquema para crear variante
export const createVariantSchema = z.object({
  title: z.string().min(1, 'El título de la variante es requerido'),
  sku: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio debe ser un número válido'),
  compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  inventoryQuantity: z.number().int().min(0).optional(),
  options: z.array(variantOptionSchema).optional(),
});

// Esquema para crear producto
export const createProductSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(createVariantSchema).min(1, 'Al menos una variante es requerida'),
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
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;
export type CreateImageInput = z.infer<typeof createImageSchema>;