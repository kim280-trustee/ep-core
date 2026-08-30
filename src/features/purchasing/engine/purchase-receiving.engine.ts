import {
  inventoryTransactionService,
} from "@/features/inventory-transactions/services/inventory-transaction.service";

import {
  receivingValidationEngine,
} from "./receiving-validation.engine";

import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


class PurchaseReceivingEngine {

  async receive(
    order: PurchaseOrder,
  ): Promise<PurchaseOrder> {

    receivingValidationEngine.validate(
      order,
    );


    if (!order.warehouseId) {

      throw new Error(
        "Cannot receive purchase order without a warehouse.",
      );

    }


    const items: PurchaseOrderItem[] =
      [];


    for (
      const item of order.items
    ) {

      const receivedItem =
        await this.receiveItem(
          order,
          item,
        );


      items.push(
        receivedItem,
      );

    }


    const completed =
      items.every(
        (item: PurchaseOrderItem) =>
          item.receivedQuantity >=
          item.quantity,
      );


    return {

      ...order,

      items,

      status:
        completed
          ? "RECEIVED"
          : "PARTIALLY_RECEIVED",

      updatedAt:
        new Date().toISOString(),

    };

  }


  private async receiveItem(
    order: PurchaseOrder,
    item: PurchaseOrderItem,
  ): Promise<PurchaseOrderItem> {

    const remaining =
      item.quantity -
      item.receivedQuantity;


    if (
      remaining <= 0
    ) {

      return item;

    }


    if (!order.warehouseId) {

      throw new Error(
        "Cannot receive purchase order without a warehouse.",
      );

    }


    await inventoryTransactionService.receiveStock(

      item.productId,

      order.warehouseId,

      remaining,

      item.unitCost,

      order.id,

      `Purchase order ${order.orderNumber} received`,

    );


    return {

      ...item,

      receivedQuantity:
        item.quantity,

      updatedAt:
        new Date().toISOString(),

    };

  }

}


export const purchaseReceivingEngine =
  new PurchaseReceivingEngine();
