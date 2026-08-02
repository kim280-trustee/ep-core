import {
  z,
} from "zod";


export const inventoryRecordSchema = z.object({


  id:
    z.string(),


  productId:
    z.string()
      .min(1),


  warehouseId:
    z.string()
      .min(1),


  quantityOnHand:
    z.number()
      .min(0),


  reservedQuantity:
    z.number()
      .min(0),


  availableQuantity:
    z.number()
      .min(0),


  averageCost:
    z.number()
      .min(0),


  minimumStockLevel:
    z.number()
      .min(0),


  maximumStockLevel:
    z.number()
      .min(0)
      .optional(),


  lastMovementAt:
    z.string()
    .optional(),


  createdAt:
    z.string(),


  updatedAt:
    z.string(),


});



export const stockAdjustmentSchema = z.object({


  productId:
    z.string()
      .min(1),


  warehouseId:
    z.string()
      .min(1),


  currentQuantity:
    z.number()
      .min(0),


  newQuantity:
    z.number()
      .min(0),


  reason:
    z.string()
      .min(2),


});



export const stockTransferSchema = z.object({


  productId:
    z.string()
      .min(1),


  sourceWarehouseId:
    z.string()
      .min(1),


  destinationWarehouseId:
    z.string()
      .min(1),


  quantity:
    z.number()
      .positive(),


});