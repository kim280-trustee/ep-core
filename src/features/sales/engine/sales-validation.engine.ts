import type {
  SalesOrder,
} from "../types/sales-order.types";

export interface SalesValidationResult {
  valid: boolean;
  errors: string[];
}

export class SalesValidationEngine {
  validateOrder(
    order: SalesOrder,
  ): SalesValidationResult {
    const errors: string[] = [];

    if (!order.id) {
      errors.push("Sales order ID is required.");
    }

    if (!order.tenantId) {
      errors.push("Tenant ID is required.");
    }

    if (!order.storeId) {
      errors.push("Store ID is required.");
    }

    if (!order.warehouseId) {
      errors.push("Warehouse ID is required.");
    }

    if (!order.orderNumber) {
      errors.push("Order number is required.");
    }

    if (!Array.isArray(order.items)) {
      errors.push("Sales order items must be an array.");
    }

    if (order.items.length === 0) {
      errors.push(
        "Sales order must contain at least one item.",
      );
    }

    if (
      !Number.isFinite(order.subtotal) ||
      order.subtotal < 0
    ) {
      errors.push("Subtotal must be a valid non-negative number.");
    }

    if (
      !Number.isFinite(order.discountAmount) ||
      order.discountAmount < 0
    ) {
      errors.push(
        "Discount amount must be a valid non-negative number.",
      );
    }

    if (
      !Number.isFinite(order.taxAmount) ||
      order.taxAmount < 0
    ) {
      errors.push(
        "Tax amount must be a valid non-negative number.",
      );
    }

    if (
      !Number.isFinite(order.totalAmount) ||
      order.totalAmount < 0
    ) {
      errors.push(
        "Total amount must be a valid non-negative number.",
      );
    }

    for (const item of order.items) {
      if (!item.id) {
        errors.push("Every sales order item requires an ID.");
      }

      if (!item.productId) {
        errors.push(
          "Every sales order item requires a product.",
        );
      }

      if (
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        errors.push(
          `Invalid quantity for product ${item.productId || "unknown"}.`,
        );
      }

      if (
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0
      ) {
        errors.push(
          `Invalid unit price for product ${item.productId || "unknown"}.`,
        );
      }

      if (
        !Number.isFinite(item.discountAmount) ||
        item.discountAmount < 0
      ) {
        errors.push(
          `Invalid discount for product ${item.productId || "unknown"}.`,
        );
      }

      if (
        !Number.isFinite(item.taxRate) ||
        item.taxRate < 0 ||
        item.taxRate > 100
      ) {
        errors.push(
          `Invalid tax rate for product ${item.productId || "unknown"}.`,
        );
      }

      if (
        !Number.isFinite(item.lineTotal) ||
        item.lineTotal < 0
      ) {
        errors.push(
          `Invalid line total for product ${item.productId || "unknown"}.`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  assertValidOrder(
    order: SalesOrder,
  ): void {
    const result =
      this.validateOrder(order);

    if (!result.valid) {
      throw new Error(
        result.errors.join(" "),
      );
    }
  }
}

export const salesValidationEngine =
  new SalesValidationEngine();
