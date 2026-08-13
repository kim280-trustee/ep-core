/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Module
 * ------------------------------------------------------------
 * Product Validation Schema
 * ============================================================
 */

import type {
  ProductFormValues,
} from "../schemas/product.schema";

import {
  z,
} from "zod";


import {
  ProductType,
} from "../types/product.types";




export const productIdentifiersSchema =

  z.object({

    sku:

      z
        .string()
        .min(
          1,
          "SKU is required",
        ),


    barcode:

      z
        .string()
        .nullable()
        .optional(),

  });






export const productPricingSchema =

  z.object({

    costPrice:

      z
        .number()
        .min(
          0,
          "Cost price cannot be negative",
        ),


    sellingPrice:

      z
        .number()
        .min(
          0,
          "Selling price cannot be negative",
        ),


    currency:

      z
        .string()
        .min(
          3,
          "Currency is required",
        ),

  });







export const productTaxSchema =

  z.object({

    taxId:

      z
        .string()
        .nullable(),


    taxRate:

      z
        .number()
        .min(
          0,
          "Tax rate cannot be negative",
        ),

  });







export const productInventorySchema =

  z.object({

    trackInventory:

      z.boolean(),


    stockQuantity:

      z
        .number()
        .min(
          0,
          "Stock cannot be negative",
        ),

  });







export const createProductSchema =

  z.object({

    name:

      z
        .string()
        .min(
          2,
          "Product name must have at least 2 characters",
        ),



    description:

      z
        .string()
        .nullable()
        .optional(),




    type:

      z
        .nativeEnum(
          ProductType,
        )
        .optional(),




    identifiers:

      productIdentifiersSchema,




    pricing:

      productPricingSchema,




    tax:

      productTaxSchema
        .optional(),




    inventory:

      productInventorySchema
        .optional(),




    categoryId:

      z
        .string()
        .nullable()
        .optional(),




    brandId:

      z
        .string()
        .nullable()
        .optional(),




    unitId:

      z
        .string()
        .nullable()
        .optional(),




    imageUrl:

      z
        .string()
        .nullable()
        .optional(),


  });






export type CreateProductFormData =
  ProductFormValues;