import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import {
  inventoryService,
} from "../../inventory/services/inventory.service";

export class InventoryUpdateEngine {

  async receive(
    order: PurchaseOrder,
  ): Promise<void> {

    for (const item of order.items) {

      const quantity =
        item.quantityOrdered -
        item.quantityReceived;

      if (quantity <= 0) {
        continue;
      }

      const record =
        await inventoryService.getInventoryRecord(
          order.tenantId,
          item.productId,
          order.warehouseId,
        );

      if (!record) {
        throw new Error(
          `Inventory record not found for product ${item.productId}.`,
        );
      }

      await inventoryService.increaseStock(record, quantity, item.unitCost);
    }
  }
}

export const inventoryUpdateEngine =
  new InventoryUpdateEngine();
