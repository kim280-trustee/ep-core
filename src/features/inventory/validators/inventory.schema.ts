import {
  z,
} from "zod";


export const inventorySchema =
  z.object({

    productId:
      z.string().min(
        1,
        "Product is required",
      ),

    warehouseId:
      z.string().min(
        1,
        "Warehouse is required",
      ),

    quantityOnHand:
      z.number(),

    reservedQuantity:
      z.number(),

    availableQuantity:
      z.number(),

    averageCost:
      z.number(),

    reorderLevel:
      z.number(),

    reorderQuantity:
      z.number(),

  });


export type InventoryFormData =
  z.infer<
    typeof inventorySchema
  >;