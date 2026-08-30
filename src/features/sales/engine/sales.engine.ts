import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";

export interface SalesCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

function roundMoney(
  value: number,
): number {
  return Number(
    value.toFixed(2),
  );
}

export class SalesEngine {

  calculateItem(
    item: SalesOrderItem,
  ): SalesOrderItem {

    if (!item.productId.trim()) {
      throw new Error(
        "Product ID is required.",
      );
    }

    if (
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Quantity must be greater than zero.",
      );
    }

    if (
      !Number.isFinite(item.unitPrice) ||
      item.unitPrice < 0
    ) {
      throw new Error(
        "Unit price must be zero or greater.",
      );
    }

    if (
      !Number.isFinite(
        item.discountAmount,
      ) ||
      item.discountAmount < 0
    ) {
      throw new Error(
        "Discount amount must be zero or greater.",
      );
    }

    if (
      !Number.isFinite(item.taxRate) ||
      item.taxRate < 0 ||
      item.taxRate > 100
    ) {
      throw new Error(
        "Tax rate must be between 0 and 100.",
      );
    }

    const subtotal =
      roundMoney(
        item.quantity *
          item.unitPrice,
      );

    const discountAmount =
      roundMoney(
        Math.min(
          item.discountAmount,
          subtotal,
        ),
      );

    const taxableAmount =
      roundMoney(
        subtotal -
          discountAmount,
      );

    const taxAmount =
      roundMoney(
        taxableAmount *
          (item.taxRate / 100),
      );

    const lineTotal =
      roundMoney(
        taxableAmount +
          taxAmount,
      );

    return {
      ...item,

      discountAmount,

      lineTotal,
    };
  }

  calculateOrder(
    items: SalesOrderItem[],
  ): SalesCalculationResult {

    if (items.length === 0) {
      return {
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
      };
    }

    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    for (const item of items) {

      const calculated =
        this.calculateItem(item);

      const itemSubtotal =
        roundMoney(
          calculated.quantity *
            calculated.unitPrice,
        );

      const taxableAmount =
        roundMoney(
          itemSubtotal -
            calculated.discountAmount,
        );

      subtotal =
        roundMoney(
          subtotal +
            itemSubtotal,
        );

      discountAmount =
        roundMoney(
          discountAmount +
            calculated.discountAmount,
        );

      taxAmount =
        roundMoney(
          taxAmount +
            taxableAmount *
              (
                calculated.taxRate /
                100
              ),
        );
    }

    const totalAmount =
      roundMoney(
        subtotal -
          discountAmount +
          taxAmount,
      );

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  }
}

export const salesEngine =
  new SalesEngine();
