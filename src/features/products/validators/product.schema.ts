import {
  z,
} from "zod";


export const productSchema = z.object({

  name: z
    .string()
    .min(2, "Product name must contain at least 2 characters")
    .max(150),

  description: z
    .string()
    .max(500)
    .optional(),

  productType: z.enum([
    "simple",
    "variable",
    "service",
  ]),

  sku: z
    .string()
    .min(3)
    .max(50),

  barcode: z
    .string()
    .max(100)
    .optional(),

  categoryId: z
    .string()
    .optional(),

  brandId: z
    .string()
    .optional(),

  unitId: z
    .string()
    .min(1),

  costPrice: z
    .number()
    .min(0),

  sellingPrice: z
    .number()
    .min(0),

  wholesalePrice: z
    .number()
    .min(0)
    .optional(),

  currency: z
    .string()
    .length(3),

  trackInventory: z
    .boolean(),

  stockQuantity: z
    .number()
    .min(0),

  minimumStockLevel: z
    .number()
    .min(0)
    .optional(),

  maximumStockLevel: z
    .number()
    .min(0)
    .optional(),

  taxable: z
    .boolean(),

  taxRate: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  imageUrl: z
    .string()
    .url()
    .optional(),

});


export type ProductFormInput = z.infer<
  typeof productSchema
>;