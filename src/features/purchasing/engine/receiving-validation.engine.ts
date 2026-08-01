import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

export class ReceivingValidationEngine {

  validate(
    order: PurchaseOrder,
  ): void {

    if (!order) {
      throw new Error(
        "Purchase order not found.",
      );
    }

    if (
      order.status !== "APPROVED" &&
      order.status !== "PARTIALLY_RECEIVED"
    ) {
      throw new Error(
        "Purchase order cannot be received.",
      );
    }

    if (order.items.length === 0) {
      throw new Error(
        "Purchase order has no items.",
      );
    }

    for (const item of order.items) {

      if (
        item.quantityOrdered <= 0
      ) {
        throw new Error(
          `Invalid quantity for product ${item.productId}.`,
        );
      }

      if (
        item.unitCost < 0
      ) {
        throw new Error(
          `Invalid unit cost for product ${item.productId}.`,
        );
      }

      if (
        item.quantityReceived >
        item.quantityOrdered
      ) {
        throw new Error(
          `Received quantity exceeds ordered quantity for product ${item.productId}.`,
        );
      }

    }

  }

}

export const receivingValidationEngine =
  new ReceivingValidationEngine();