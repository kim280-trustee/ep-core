import type {
  PaymentEntry,
} from "./payment/payment.engine";

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
} from "../../inventory-transactions/services/inventory-transaction.service";


export class SalesEngine {


  async processSale(
    items: SaleItem[],
    payments: PaymentEntry[],
    warehouseId: string,
    tenantId: string,
    storeId: string,
    discountRate = 0,
    taxRate = 0,
  ) {

    const checkout =
      checkoutEngine.checkout(
        items,
        payments,
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


    for (
      const item of items
    ) {

      const inventoryRecord =
        await inventoryService.getInventoryRecord(
          tenantId,
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


      await inventoryService.decreaseStock(
        inventoryRecord,
        item.quantity,
      );


      await inventoryTransactionService.createTransaction({

        tenantId,

        storeId,

        productId:
          item.productId,

        warehouseId,

        movementType:
          "SALE",

        quantity:
          -item.quantity,

        unitCost:
          inventoryRecord.averageCost,

        referenceType:
          "SALE",

        referenceId:
          transactionId,

        notes:
          "Sale transaction",

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
