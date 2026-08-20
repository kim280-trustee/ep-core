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


    await inventoryService.increaseStock(
      record,
      remaining,
      item.unitCost,
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