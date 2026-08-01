import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import {
  inventoryService,
} from "../../inventory/services/inventory.service";

export class InventoryUpdateEngine {

  receive(
    order: PurchaseOrder,
  ): void {

    for (const item of order.items) {

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

      const quantity =

        item.quantityOrdered -

        item.quantityReceived;

      if (quantity <= 0) {

        continue;

      }

      inventoryService.increaseStock(

        record,

        quantity,

        item.unitCost,

      );

    }

  }

}

export const inventoryUpdateEngine =
  new InventoryUpdateEngine();