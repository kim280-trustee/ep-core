import {
  z,
} from "zod";


export const purchaseOrderSchema = z.object({

  supplierId: z
    .string()
    .min(
      1,
      "Supplier is required",
    ),


  warehouseId: z
    .string()
    .min(
      1,
      "Warehouse is required",
    ),


  notes: z
    .string()
    .optional(),

});


export type PurchaseOrderFormInput =

  z.infer<
    typeof purchaseOrderSchema
  >;