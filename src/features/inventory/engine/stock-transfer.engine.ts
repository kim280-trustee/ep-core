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


    if (quantity <= 0) {

      throw new Error(
        "Transfer quantity must be greater than zero.",
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


      movementType:
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