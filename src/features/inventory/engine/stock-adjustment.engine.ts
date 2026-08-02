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

  ): InventoryRecord {


    if (newQuantity < 0) {

      throw new Error(
        "Quantity cannot be negative.",
      );

    }



    const difference =

      newQuantity -

      record.quantityOnHand;



    if (difference === 0) {

      return record;

    }



    inventoryMovementEngine.createMovement({


      productId:

        record.productId,


      warehouseId:

        record.warehouseId,


      type:

        difference > 0

          ? "ADJUSTMENT_IN"

          : "ADJUSTMENT_OUT",


      quantity:

        Math.abs(difference),


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