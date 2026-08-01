/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Customers Module
 * ------------------------------------------------------------
 * Customer Validation Schema
 * ============================================================
 */


import {
  z,
} from "zod";



export const customerSchema = z.object({


  name:
    z.string()
      .min(1),



  customerType:
    z.enum([
      "regular",
      "retail",
      "wholesale",
    ]),



  phone:
    z.string()
      .nullable()
      .optional(),



  email:
    z.string()
      .nullable()
      .optional(),



  address:
    z.string()
      .nullable()
      .optional(),



  taxNumber:
    z.string()
      .nullable()
      .optional(),



  creditLimit:
    z.number()
      .nullable()
      .optional(),


});



export type CustomerFormInput =
  z.infer<
    typeof customerSchema
  >;