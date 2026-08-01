/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Validation
 * ============================================================
 */

import {
  z,
} from "zod";



export const supplierSchema = z.object({

  code:
    z.string()
      .min(1, "Supplier code is required"),


  name:
    z.string()
      .min(2, "Supplier name is required"),


  contactPerson:
    z.string()
      .min(2, "Contact person is required"),


  email:
    z.string()
      .email("Invalid email")
      .or(z.literal("")),


  phone:
    z.string()
      .min(5, "Phone number is required"),


  address:
    z.string()
      .min(2, "Address is required"),


  city:
    z.string()
      .min(2, "City is required"),


  province:
    z.string()
      .min(2, "Province is required"),


  postalCode:
    z.string()
      .min(2, "Postal code is required"),


  country:
    z.string()
      .min(2, "Country is required"),


  taxId:
    z.string()
      .optional(),


  notes:
    z.string()
      .optional(),

});



export type SupplierFormInput =
  z.infer<
    typeof supplierSchema
  >;