import {
  inventoryContext,
} from "../repositories/inventory-context";


import type {
  InventoryRecord,
} from "../types/inventory-record.types";


import {
  inventoryMovementEngine,
} from "../engine";



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


    const updatedRecord =

      inventoryMovementEngine.increase(

        record,

        quantity,

      );



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

          updatedRecord.quantityOnHand,



        availableQuantity:

          updatedRecord.quantityOnHand -

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


    const updatedRecord =

      inventoryMovementEngine.decrease(

        record,

        quantity,

      );



    return inventoryContext.repository.update(

      record.id,

      {


        quantityOnHand:

          updatedRecord.quantityOnHand,



        availableQuantity:

          updatedRecord.quantityOnHand -

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







  releaseReservedStock(

    record: InventoryRecord,

    quantity: number,

  ) {


    const newReserved =

      Math.max(

        0,

        record.reservedQuantity -

        quantity,

      );



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







  getProductStock(

    productId: string,

  ) {

    return inventoryContext.repository

      .findAll()

      .filter(

        (record) =>

          record.productId === productId,

      );

  }







  getWarehouseInventory(

    warehouseId: string,

  ) {

    return inventoryContext.repository

      .findAll()

      .filter(

        (record) =>

          record.warehouseId === warehouseId,

      );

  }







  getAvailableStock(

    productId: string,

  ) {


    return inventoryContext.repository

      .findAll()

      .filter(

        (record) =>

          record.productId === productId,

      )

      .reduce(

        (

          total,

          record,

        ) =>

          total +

          record.availableQuantity,


        0,

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