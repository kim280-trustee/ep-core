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


    let orderStatus = order.status;
    if (orderStatus === "DRAFT") {
      await salesOrderService.confirmOrder(order.id);
      orderStatus = "CONFIRMED";
    }

    if (orderStatus === "CONFIRMED") {
      await salesOrderService.processOrder(order.id);
      orderStatus = "PROCESSING";
    }

    if (orderStatus !== "PROCESSING") {
      throw new Error(`Sales order cannot be checked out from status ${orderStatus}.`);
    }


    const payment =
      await paymentEngine.process(
        input.tenantId,
        order.id,
        input.paymentMethod,
        input.paymentAmount,
      );


    const completedPayment =
      await paymentEngine.complete(
        input.tenantId,
        payment.id,
      );


    if (!completedPayment) {

      throw new Error(
        "Payment failed.",
      );

    }


    await salesOrderService.completeOrder(order.id);

    const receipt =
      receiptEngine.issue(
        input.tenantId,
        order.id,
        payment.id,
        order.totalAmount,
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
