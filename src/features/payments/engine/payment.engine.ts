import {
  paymentService,
} from "../services/payment.service";

import type {
  Payment,
  PaymentMethod,
} from "../types/payment.types";

import {
  storeContext,
} from "@/core/store/store.context";


class PaymentEngine {


  async process(
    tenantId: string,
    salesOrderId: string,
    method: PaymentMethod,
    amount: number,
    provider?: string,
  ): Promise<Payment> {

    return paymentService.createPayment(
      tenantId,
      salesOrderId,
      method,
      amount,
      provider,
    );

  }


  async complete(
    tenantIdOrPaymentId: string,
    paymentId?: string,
  ): Promise<Payment | undefined> {

    let tenantId: string;
    let id: string;


    if (paymentId) {

      tenantId =
        tenantIdOrPaymentId;

      id =
        paymentId;

    } else {

      const context =
        storeContext.getStore();


      if (!context?.tenantId) {

        throw new Error(
          "Store context is not initialized.",
        );

      }


      tenantId =
        context.tenantId;

      id =
        tenantIdOrPaymentId;

    }


    return paymentService.completePayment(
      tenantId,
      id,
    );

  }


  async fail(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined> {

    return paymentService.failPayment(
      tenantId,
      id,
    );

  }


  async refund(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined> {

    return paymentService.refundPayment(
      tenantId,
      id,
    );

  }

}


export const paymentEngine =
  new PaymentEngine();

