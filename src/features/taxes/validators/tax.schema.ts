/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * Tax Validation Schema
 * ============================================================
 */


import {
  z,
} from "zod";



export const taxSchema = z.object({


  name:
    z.string()
      .min(1),



  code:
    z.string()
      .optional(),



  rate:
    z.number()
      .min(0)
      .max(100),



  country:
    z.string()
      .min(1),



  currency:
    z.string()
      .min(1),


});



export type TaxFormInput =
  z.infer<
    typeof taxSchema
  >;