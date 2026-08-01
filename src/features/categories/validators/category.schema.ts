/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 * ------------------------------------------------------------
 * Category Validation Schema
 * ============================================================
 */


import {
  z,
} from "zod";





export const categorySchema = z.object({



  name:

    z.string()

      .trim()

      .min(

        2,

        "Category name must contain at least 2 characters.",

      )

      .max(

        100,

        "Category name cannot exceed 100 characters.",

      ),





  description:

    z.string()

      .trim()

      .max(

        500,

        "Description cannot exceed 500 characters.",

      )

      .optional()

      .nullable(),





  parentId:

    z.string()

      .optional()

      .nullable(),



});







export type CategoryFormInput =

  z.infer<

    typeof categorySchema

  >;