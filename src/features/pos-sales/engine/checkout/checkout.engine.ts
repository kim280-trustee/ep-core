import type {
  SaleItem,
} from "../../types/sale-item.types";

import {
  paymentEngine,
  type PaymentEntry,
  type PaymentResult,
} from "../payment/payment.engine";

import {
  pricingEngine,
  type PricingSummary,
} from "../pricing/pricing.engine";

export interface CheckoutResult {
  pricing: PricingSummary;

  payment: PaymentResult;

  completed: boolean;
}

export class CheckoutEngine {
  process(
    items: SaleItem[],
    payments: PaymentEntry[],
  ): CheckoutResult {
    if (
      items.length === 0
    ) {
      throw new Error(
        "Cannot checkout an empty cart.",
      );
    }

    const pricing =
      pricingEngine.calculate(
        items,
      );

    const payment =
      paymentEngine.process(
        pricing.totalAmount,
        payments,
      );

    if (
      !payment.completed
    ) {
      throw new Error(
        "Payment incomplete.",
      );
    }

    return {
      pricing,
      payment,
      completed: true,
    };
  }
}

export const checkoutEngine =
  new CheckoutEngine();
