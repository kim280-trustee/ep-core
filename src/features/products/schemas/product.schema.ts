/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Validation Schema
 * ============================================================
 */

import { z } from "zod";

import {
  ProductStatus,
  ProductType,
} from "../types/product.types";


export const createProductSchema =
z.object({

  name:
    z.string()
    .min(
      2,
      "Product name must have at least 2 characters",
    ),


  sku:
    z.string()
    .min(
      1,
      "SKU is required",
    ),


  barcode:
    z.string()
    .nullable()
    .optional(),


  description:
    z.string()
    .nullable()
    .optional(),


  currency:
    z.string()
    .min(
      3,
      "Currency is required",
    )
    .default("THB"),


  productType:
    z.nativeEnum(ProductType),


  status:
    z.nativeEnum(ProductStatus),


  costPrice:
    z.number()
    .min(
      0,
      "Cost price cannot be negative",
    ),


  sellingPrice:
    z.number()
    .min(
      0,
      "Selling price cannot be negative",
    ),


  trackInventory:
    z.boolean(),


  categoryId:
    z.string()
    .nullable()
    .optional(),


  brandId:
    z.string()
    .nullable()
    .optional(),


  unitId:
    z.string()
    .nullable()
    .optional(),


  taxId:
    z.string()
    .nullable()
    .optional(),


  imageUrl:
    z.string()
    .nullable()
    .optional(),

});


export type ProductFormValues =
z.infer<
  typeof createProductSchema
>;