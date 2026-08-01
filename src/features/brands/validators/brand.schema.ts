/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Module
 * ------------------------------------------------------------
 * Brand Validation Schema
 * ============================================================
 */


import {

  z,

} from "zod";







export const brandSchema = z.object({



  name:


    z.string()

      .trim()

      .min(

        2,

        "Brand name must contain at least 2 characters.",

      )

      .max(

        100,

        "Brand name cannot exceed 100 characters.",

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



});







export type BrandFormInput =


  z.infer<

    typeof brandSchema

  >;