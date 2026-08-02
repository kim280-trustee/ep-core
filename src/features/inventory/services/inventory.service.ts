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



    const currentStockValue =

      record.quantityOnHand *

      record.averageCost;



    const incomingStockValue =

      quantity *

      incomingCost;



    const totalQuantity =

      updatedRecord.quantityOnHand;



    const averageCost =

      totalQuantity === 0

        ? 0

        :

        (

          currentStockValue +

          incomingStockValue

        )

        /

        totalQuantity;



    return inventoryContext.repository.update(

      record.id,

      {


        quantityOnHand:

          updatedRecord.quantityOnHand,


        availableQuantity:

          updatedRecord.availableQuantity,


        averageCost,


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

          updatedRecord.availableQuantity,


        lastMovementAt:

          new Date().toISOString(),


      },

    );


  }





  reserveStock(

    record: InventoryRecord,

    quantity: number,

  ) {



    if (quantity <= 0) {

      throw new Error(

        "Reservation quantity must be greater than zero.",

      );

    }



    const reservedQuantity =

      record.reservedQuantity +

      quantity;



    if (

      reservedQuantity >

      record.quantityOnHand

    ) {

      throw new Error(

        "Cannot reserve more than available stock.",

      );

    }



    return inventoryContext.repository.update(

      record.id,

      {


        reservedQuantity,


        availableQuantity:

          record.quantityOnHand -

          reservedQuantity,


      },

    );


  }





  releaseReservedStock(

    record: InventoryRecord,

    quantity: number,

  ) {



    if (quantity <= 0) {

      throw new Error(

        "Release quantity must be greater than zero.",

      );

    }



    const reservedQuantity =

      Math.max(

        0,

        record.reservedQuantity -

        quantity,

      );



    return inventoryContext.repository.update(

      record.id,

      {


        reservedQuantity,


        availableQuantity:

          record.quantityOnHand -

          reservedQuantity,


      },

    );


  }





  getProductStock(

    productId: string,

  ) {


    return inventoryContext.repository

      .findByProduct(

        productId,

      );


  }





  getWarehouseInventory(

    warehouseId: string,

  ) {


    return inventoryContext.repository

      .findByWarehouse(

        warehouseId,

      );


  }





  getAvailableStock(

    productId: string,

  ) {



    return this.getProductStock(

      productId,

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