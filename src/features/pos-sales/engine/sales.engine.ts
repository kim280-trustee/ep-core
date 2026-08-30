import type {
  SaleItem,
} from "../types/sale-item.types";

import {
  checkoutEngine,
} from "./checkout/checkout.engine";

export class SalesEngine {
  async processSale(
    items: SaleItem[],
    payments: Parameters<
      typeof checkoutEngine.process
    >[1],
  ) {
    if (items.length === 0) {
      throw new Error(
        "Cannot process an empty sale.",
      );
    }

    for (const item of items) {
      if (!item.productId) {
        throw new Error(
          "Every sale item requires a product.",
        );
      }

      if (
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error(
          "Sale quantity must be greater than zero.",
        );
      }

      if (
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0
      ) {
        throw new Error(
          "Sale price must be zero or greater.",
        );
      }
    }

    const checkout =
      checkoutEngine.process(
        items,
        payments,
      );

    if (!checkout.completed) {
      throw new Error(
        "Payment incomplete.",
      );
    }

    const payment =
      checkout.payment;

    return {
      completed: true,
      items,
      subtotal:
        items.reduce(
          (sum, item) =>
            sum +
            item.quantity *
              item.unitPrice,
          0,
        ),
      taxAmount:
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.taxAmount ?? 0,
            ),
          0,
        ),
      totalAmount:
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.lineTotal ?? 0,
            ),
          0,
        ),
      payment,
    };
  }
}

export const salesEngine =
  new SalesEngine();