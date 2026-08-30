import type {
  SaleItem,
} from "../../types/sale-item.types";

export interface PricingSummary {
  subtotal: number;

  discountAmount: number;

  taxableAmount: number;

  taxAmount: number;

  totalAmount: number;
}

export class PricingEngine {
  calculate(
    items: SaleItem[],
  ): PricingSummary {
    const subtotal =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.quantity *
            item.unitPrice,
        0,
      );

    const discountAmount =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.discountAmount,
        0,
      );

    const taxableAmount =
      Math.max(
        0,
        subtotal -
          discountAmount,
      );

    const taxAmount =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          (item.taxAmount ?? 0),
        0,
      );

    const totalAmount =
      taxableAmount +
      taxAmount;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      totalAmount,
    };
  }
}

export const pricingEngine =
  new PricingEngine();
