import {
  z,
} from "zod";


export const taxSchema = z.object({

  name: z
    .string()
    .min(
      2,
      "Tax name must contain at least 2 characters",
    ),


  rate: z
    .number()
    .min(
      0,
    )
    .max(
      100,
    ),


  country: z
    .string()
    .min(
      2,
      "Country is required",
    ),


  currency: z
    .string()
    .min(
      3,
      "Currency is required",
    ),

});


export type TaxFormInput =
  z.infer<
    typeof taxSchema
  >;