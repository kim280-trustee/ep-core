import type {
  SaleItem,
} from "../types";


import {
  checkoutEngine,
} from "./checkout/checkout.engine";


import {
  receiptEngine,
} from "./receipt/receipt.engine";


import {
  inventoryService,
} from "../../inventory/services/inventory.service";


import {
  inventoryTransactionService,
} from "../../inventory/services/inventory-transaction.service";



export class SalesEngine {


  processSale(

    items: SaleItem[],

    amountPaid: number,

    warehouseId: string,

    tenantId: string,

    storeId: string,

    discountRate = 0,

    taxRate = 0,

  ) {


    const checkout =

      checkoutEngine.checkout(

        items,

        amountPaid,

        discountRate,

        taxRate,

      );



    if (!checkout.completed) {

      return {

        success: false,

        message:

          "Payment incomplete",

        checkout,

      };

    }



    const transactionId =

      crypto.randomUUID();



    for (const item of items) {


      const inventoryRecord =

        inventoryService.getInventoryRecord(

          item.productId,

          warehouseId,

        );



      if (!inventoryRecord) {

        return {

          success: false,

          message:

            `Inventory record missing for ${item.productId}`,

        };

      }



      if (

        inventoryRecord.availableQuantity <

        item.quantity

      ) {

        return {

          success: false,

          message:

            `Insufficient stock for ${item.productId}`,

        };

      }



      const beforeQuantity =

        inventoryRecord.quantityOnHand;



      inventoryService.decreaseStock(

        inventoryRecord,

        item.quantity,

      );



      const afterQuantity =

        beforeQuantity -

        item.quantity;



      inventoryTransactionService.createTransaction({

        id:

          crypto.randomUUID(),

        tenantId,

        storeId,

        warehouseId,

        productId:

          item.productId,

        type:

          "sale",

        quantity:

          -item.quantity,

        beforeQuantity,

        afterQuantity,

        referenceId:

          transactionId,

        note:

          "Sale transaction",

        createdAt:

          new Date().toISOString(),

      });


    }



    const receipt =

      receiptEngine.generate(

        checkout.items,

        checkout.pricing,

        checkout.payment,

      );



    return {

      success: true,

      transactionId,

      checkout,

      receipt,

    };


  }


}



export const salesEngine =

  new SalesEngine();