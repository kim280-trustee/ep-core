import {
  paymentService,
} from "../services/payment.service";


import type {
  Payment,
  PaymentMethod,
} from "../types/payment.types";


export class PaymentEngine {


  process(

    tenantId: string,

    salesOrderId: string,

    method: PaymentMethod,

    amount: number,

  ): Payment {


    if (amount <= 0) {

      throw new Error(

        "Payment amount must be greater than zero.",

      );

    }


    return paymentService.createPayment(

      tenantId,

      salesOrderId,

      method,

      amount,

    );

  }



  complete(

    paymentId: string,

    reference?: string,

  ) {

    return paymentService.completePayment(

      paymentId,

      reference,

    );

  }



  fail(

    paymentId: string,

  ) {

    return paymentService.failPayment(

      paymentId,

    );

  }


}


export const paymentEngine =

  new PaymentEngine();