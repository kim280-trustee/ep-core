import type {
  SalesOrder,
} from "../types/sales-order.types";


import {
  salesValidationEngine,
} from "./sales-validation.engine";


import {
  inventoryService,
} from "../../inventory/services/inventory.service";



export class SalesProcessingEngine {



  process(

    order: SalesOrder,

  ): SalesOrder {


    salesValidationEngine.validate(

      order,

    );



    for (const item of order.items) {


      const inventoryRecord =

        inventoryService.getInventoryRecord(

          item.productId,

          order.warehouseId,

        );



      if (!inventoryRecord) {


        throw new Error(

          `Inventory record not found for product ${item.productId}.`,

        );


      }



      if (

        inventoryRecord.availableQuantity <

        item.quantity

      ) {


        throw new Error(

          `Insufficient stock for product ${item.productId}.`,

        );


      }



    }



    for (const item of order.items) {


      const inventoryRecord =

        inventoryService.getInventoryRecord(

          item.productId,

          order.warehouseId,

        );



      if (!inventoryRecord) {

        throw new Error(

          "Inventory record missing.",

        );

      }



      inventoryService.decreaseStock(

        inventoryRecord,

        item.quantity,

      );


    }



    return {


      ...order,



      status:

        "COMPLETED",



      paymentStatus:

        "UNPAID",



      updatedAt:

        new Date().toISOString(),


    };


  }



}



export const salesProcessingEngine =

  new SalesProcessingEngine();