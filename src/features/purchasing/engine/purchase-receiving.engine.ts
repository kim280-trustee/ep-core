import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";

import {
  inventoryService,
} from "../../inventory/services/inventory.service";

import {
  receivingValidationEngine,
} from "./receiving-validation.engine";

export class PurchaseReceivingEngine {

  receive(
    order: PurchaseOrder,
  ): PurchaseOrder {

    receivingValidationEngine.validate(
      order,
    );

    const items = order.items.map(
      (item) =>
        this.receiveItem(
          order,
          item,
        ),
    );

    const completed =
      items.every(
        (item) =>
          item.quantityReceived >=
          item.quantityOrdered,
      );

    return {

      ...order,

      items,

      status: completed
        ? "RECEIVED"
        : "PARTIALLY_RECEIVED",

      updatedAt:
        new Date().toISOString(),

    };

  }

  private receiveItem(
    order: PurchaseOrder,
    item: PurchaseOrderItem,
  ): PurchaseOrderItem {

    const remaining =
      item.quantityOrdered -
      item.quantityReceived;

    if (
      remaining <= 0
    ) {
      return item;
    }

    const record =
      inventoryService.getInventoryRecord(
        item.productId,
        order.warehouseId,
      );

    if (!record) {
      throw new Error(
        `Inventory record not found for product ${item.productId}.`,
      );
    }

    inventoryService.increaseStock(
      record,
      remaining,
      item.unitCost,
    );

    return {

      ...item,

      quantityReceived:
        item.quantityOrdered,

    };

  }

}

export const purchaseReceivingEngine =
  new PurchaseReceivingEngine();