import type {
  InventoryRecord,
} from "../types/inventory-record.types";


import {
  inventoryMovementEngine,
} from "./inventory-movement.engine";



export class StockTransferEngine {


  transfer(

    source: InventoryRecord,

    destination: InventoryRecord,

    quantity: number,

  ) {


    if (

      source.quantityOnHand < quantity

    ) {

      throw new Error(
        "Insufficient stock.",
      );

    }



    const updatedSource =

      inventoryMovementEngine.decrease(

        source,

        quantity,

      );



    const updatedDestination =

      inventoryMovementEngine.increase(

        destination,

        quantity,

      );



    inventoryMovementEngine.createMovement({

      productId:

        source.productId,

      warehouseId:

        source.warehouseId,

      type:

        "TRANSFER",

      quantity,

      previousQuantity:

        source.quantityOnHand,

      newQuantity:

        updatedSource.quantityOnHand,

    });



    return {

      source:

        updatedSource,

      destination:

        updatedDestination,

    };

  }


}


export const stockTransferEngine =

  new StockTransferEngine();