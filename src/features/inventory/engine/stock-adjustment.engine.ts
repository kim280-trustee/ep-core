import type {
  InventoryRecord,
} from "../types/inventory-record.types";


import {
  inventoryMovementEngine,
} from "./inventory-movement.engine";


export class StockAdjustmentEngine {


  adjust(

    record: InventoryRecord,

    newQuantity: number,

  ) {


    if (newQuantity < 0) {

      throw new Error(
        "Quantity cannot be negative.",
      );

    }


    const difference =

      newQuantity -

      record.quantityOnHand;



    inventoryMovementEngine.createMovement({

      productId:

        record.productId,

      warehouseId:

        record.warehouseId,

      type:

        "ADJUSTMENT",

      quantity:

        difference,

      previousQuantity:

        record.quantityOnHand,

      newQuantity,

    });



    return {

      ...record,

      quantityOnHand:

        newQuantity,

      availableQuantity:

        newQuantity -

        record.reservedQuantity,

      lastMovementAt:

        new Date().toISOString(),

    };

  }


}


export const stockAdjustmentEngine =

  new StockAdjustmentEngine();