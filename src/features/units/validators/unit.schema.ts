import {
  z,
} from "zod";


export const unitSchema = z.object({

  name: z
    .string()
    .min(
      2,
      "Unit name must contain at least 2 characters",
    ),


  symbol: z
    .string()
    .min(
      1,
      "Unit symbol is required",
    ),


  description: z
    .string()
    .optional(),

});


export type UnitFormInput =
  z.infer<
    typeof unitSchema
  >;