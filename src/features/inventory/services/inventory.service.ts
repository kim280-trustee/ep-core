import {
  inventoryContext,
} from "../repositories/inventory-context";


import type {
  InventoryRecord,
} from "../types/inventory-record.types";



class InventoryService {



  getInventory() {

    return inventoryContext.repository.findAll();

  }





  getInventoryRecord(

    productId: string,

    warehouseId: string,

  ) {


    return inventoryContext.repository

      .findByProductAndWarehouse(

        productId,

        warehouseId,

      );

  }





  createInventoryRecord(

    record: InventoryRecord,

  ) {


    return inventoryContext.repository.create(
      record,
    );

  }





  increaseStock(

    record: InventoryRecord,

    quantity: number,

    incomingCost: number,

  ) {



    const currentValue =

      record.quantityOnHand *

      record.averageCost;



    const incomingValue =

      quantity *

      incomingCost;



    const totalQuantity =

      record.quantityOnHand +

      quantity;



    const newAverageCost =

      totalQuantity === 0

        ? 0

        :

        (

          currentValue +

          incomingValue

        )

        /

        totalQuantity;



    return inventoryContext.repository.update(

      record.id,

      {


        quantityOnHand:

          totalQuantity,



        availableQuantity:

          totalQuantity -

          record.reservedQuantity,



        averageCost:

          newAverageCost,



        lastMovementAt:

          new Date().toISOString(),


      },

    );

  }





  decreaseStock(

    record: InventoryRecord,

    quantity: number,

  ) {



    const newQuantity =

      record.quantityOnHand -

      quantity;



    return inventoryContext.repository.update(

      record.id,

      {


        quantityOnHand:

          newQuantity,



        availableQuantity:

          newQuantity -

          record.reservedQuantity,



        lastMovementAt:

          new Date().toISOString(),


      },

    );

  }





  reserveStock(

    record: InventoryRecord,

    quantity: number,

  ) {


    const newReserved =

      record.reservedQuantity +

      quantity;



    return inventoryContext.repository.update(

      record.id,

      {


        reservedQuantity:

          newReserved,



        availableQuantity:

          record.quantityOnHand -

          newReserved,


      },

    );

  }





  getInventoryValue(

    record: InventoryRecord,

  ) {


    return (

      record.quantityOnHand *

      record.averageCost

    );

  }



}



export const inventoryService =
  new InventoryService();