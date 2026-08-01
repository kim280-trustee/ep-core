import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

export class ReceivingStatusEngine {

  updateStatus(
    order: PurchaseOrder,
  ): PurchaseOrder {

    const completed =
      order.items.every(
        (item) =>
          item.quantityReceived >=
          item.quantityOrdered,
      );

    return {

      ...order,

      status: completed
        ? "RECEIVED"
        : "PARTIALLY_RECEIVED",

      updatedAt:
        new Date().toISOString(),

    };

  }

}

export const receivingStatusEngine =
  new ReceivingStatusEngine();