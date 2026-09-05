import type { PurchaseOrderItem } from "../types/purchase-order-item.types";
import { purchaseOrderCalculationEngine } from "./purchase-order-calculation.engine";

class PurchaseItemEngine {
  addItem(
    items: PurchaseOrderItem[],
    item: PurchaseOrderItem,
  ): PurchaseOrderItem[] {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    if (item.unitCost < 0) {
      throw new Error("Unit cost cannot be negative.");
    }

    return [...items, item];
  }

  removeItem(
    items: PurchaseOrderItem[],
    itemId: string,
  ): PurchaseOrderItem[] {
    return items.filter((item) => item.id !== itemId);
  }

  updateQuantity(
    items: PurchaseOrderItem[],
    itemId: string,
    quantity: number,
  ): PurchaseOrderItem[] {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    return items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      const calculated =
        purchaseOrderCalculationEngine.calculateLine({
          ...item,
          quantity,
        });

      return {
        ...item,
        quantity,
        taxAmount: calculated.taxAmount,
        lineTotal: calculated.lineTotal,
      };
    });
  }

  updateUnitCost(
    items: PurchaseOrderItem[],
    itemId: string,
    unitCost: number,
  ): PurchaseOrderItem[] {
    if (unitCost < 0) {
      throw new Error("Unit cost cannot be negative.");
    }

    return items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      const calculated =
        purchaseOrderCalculationEngine.calculateLine({
          ...item,
          unitCost,
        });

      return {
        ...item,
        unitCost,
        taxAmount: calculated.taxAmount,
        lineTotal: calculated.lineTotal,
      };
    });
  }
}

export const purchaseItemEngine =
  new PurchaseItemEngine();
