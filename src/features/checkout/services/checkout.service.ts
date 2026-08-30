import {
  salesProcessingEngine,
} from "../../sales/engine";

import {
  salesOrderService,
} from "../../sales/services/sales-order.service";

import {
  paymentEngine,
} from "../../payments/engine";

import {
  receiptEngine,
} from "../../receipts/engine";

import type {
  CheckoutRequest,
  CheckoutResult,
} from "../types";


class CheckoutService {


  async checkout(
    input: CheckoutRequest,
  ): Promise<CheckoutResult> {


    const order =
      await salesOrderService.getOrderById(
        input.tenantId,
        input.salesOrderId,
      );


    if (!order) {

      throw new Error(
        "Sales order not found.",
      );

    }


    const completedOrder =
      await (salesProcessingEngine as any).process(
        order,
      );


    await (salesOrderService as any).update(
      input.tenantId,
      order.id,
      completedOrder,
    );


    const payment =
      paymentEngine.process(
        input.tenantId,
        order.id,
        input.paymentMethod,
        input.paymentAmount,
      );


    const completedPayment =
      paymentEngine.complete(
        payment.id,
      );


    if (!completedPayment) {

      throw new Error(
        "Payment failed.",
      );

    }


    const receipt =
      receiptEngine.issue(
        input.tenantId,
        order.id,
        payment.id,
        input.paymentAmount,
      );


    return {

      salesOrderId:
        order.id,

      paymentId:
        payment.id,

      receiptId:
        receipt.id,

      completedAt:
        new Date().toISOString(),

    };

  }


}


export const checkoutService =
  new CheckoutService();

