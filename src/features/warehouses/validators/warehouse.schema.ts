import {
  z,
} from "zod";


export const warehouseSchema = z.object({

  code:
    z.string()
      .min(1),


  name:
    z.string()
      .min(1),


  address:
    z.string()
      .min(1),


  city:
    z.string()
      .min(1),


  province:
    z.string()
      .min(1),


  postalCode:
    z.string()
      .min(1),


  country:
    z.string()
      .min(1),


  phone:
    z.string()
      .optional(),


});



export type WarehouseFormInput =

  z.infer<
    typeof warehouseSchema
  >;