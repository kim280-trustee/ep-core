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

      const remaining =
        item.quantity -
        item.receivedQuantity;

      if (remaining <= 0) {
        items.push(item);
        continue;
      }

      await inventoryTransactionService.receiveStock(
        item.productId,
        order.warehouseId,
        remaining,
        item.unitCost,
        order.id,
        `Purchase order ${order.orderNumber} received`,
      );

      items.push({
        ...item,

        receivedQuantity:
          item.quantity,

        updatedAt:
          new Date().toISOString(),
      });
    }

    const completed =
      items.every(
        (item) =>
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
}


export const purchaseReceivingEngine =
  new PurchaseReceivingEngine();
