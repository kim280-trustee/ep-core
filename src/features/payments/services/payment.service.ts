import {
  paymentRepository,
} from "../repositories";


import type {
  Payment,
  PaymentMethod,
} from "../types/payment.types";



class PaymentService {


  getPayments() {

    return paymentRepository.findAll();

  }



  createPayment(

    tenantId: string,

    salesOrderId: string,

    method: PaymentMethod,

    amount: number,

  ) {

    const now =

      new Date().toISOString();



    const payment: Payment = {

      id:

        crypto.randomUUID(),

      tenantId,

      salesOrderId,

      method,

      amount,

      status:

        "PENDING",

      createdAt:

        now,

      updatedAt:

        now,

    };



    return paymentRepository.create(

      payment,

    );

  }



  completePayment(

    id: string,

    reference?: string,

  ) {

    return paymentRepository.update(

      id,

      {

        status:

          "COMPLETED",

        reference,

      },

    );

  }



  failPayment(

    id: string,

  ) {

    return paymentRepository.update(

      id,

      {

        status:

          "FAILED",

      },

    );

  }


}



export const paymentService =

  new PaymentService();