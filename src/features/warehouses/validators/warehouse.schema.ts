import {
  z,
} from "zod";


export const warehouseSchema = z.object({

  name: z
    .string()
    .min(
      2,
      "Warehouse name must contain at least 2 characters",
    ),


  code: z
    .string()
    .min(
      2,
      "Warehouse code is required",
    ),


  address: z
    .string()
    .optional(),


  phone: z
    .string()
    .optional(),

});


export type WarehouseFormInput =
  z.infer<
    typeof warehouseSchema
  >;