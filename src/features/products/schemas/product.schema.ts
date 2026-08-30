import {
  z,
} from "zod";

import {
  ProductStatus,
  ProductType,
} from "../types/product.types";


export const createProductSchema =
  z.object({

    name:
      z
        .string()
        .min(
          2,
          "Product name must contain at least 2 characters",
        )
        .max(150),

    description:
      z
        .string()
        .max(500)
        .optional(),

    productType:
      z.nativeEnum(
        ProductType,
      ),

    sku:
      z
        .string()
        .min(3)
        .max(50),

    barcode:
      z
        .string()
        .max(100)
        .optional(),

    categoryId:
      z
        .string()
        .optional(),

    brandId:
      z
        .string()
        .optional(),

    unitId:
      z
        .string()
        .min(1),

    taxId:
      z
        .string()
        .optional(),

    costPrice:
      z
        .number()
        .min(0),

    sellingPrice:
      z
        .number()
        .min(0),

    currency:
      z
        .string()
        .length(3),

    status:
      z.nativeEnum(
        ProductStatus,
      ),

    trackInventory:
      z
        .boolean(),

    imageUrl:
      z
        .string()
        .url()
        .optional(),

  });


export const productSchema =
  createProductSchema;


export type ProductFormInput =
  z.infer<
    typeof createProductSchema
  >;


export type ProductFormValues =
  ProductFormInput;
