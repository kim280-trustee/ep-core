import {
  create,
} from "zustand";


import {
  paymentEngine,
} from "../engine/payment.engine";


import {
  paymentService,
} from "../services/payment.service";


import type {
  Payment,
  PaymentMethod,
} from "../types/payment.types";



interface PaymentState {


  payments: Payment[];



  loadPayments: () => void;



  createPayment: (

    tenantId: string,

    salesOrderId: string,

    method: PaymentMethod,

    amount: number,

  ) => void;



  completePayment: (

    paymentId: string,

    reference?: string,

  ) => void;



  failPayment: (

    paymentId: string,

  ) => void;


}



export const usePaymentStore =

create<PaymentState>((set) => ({


  payments: [],



  loadPayments: () => {


    set({

      payments:

        paymentService.getPayments(),

    });


  },



  createPayment: (

    tenantId,

    salesOrderId,

    method,

    amount,

  ) => {


    paymentEngine.process(

      tenantId,

      salesOrderId,

      method,

      amount,

    );


    set({

      payments:

        paymentService.getPayments(),

    });


  },



  completePayment: (

    paymentId,

    reference,

  ) => {


    paymentEngine.complete(

      paymentId,

      reference,

    );


    set({

      payments:

        paymentService.getPayments(),

    });


  },



  failPayment: (

    paymentId,

  ) => {


    paymentEngine.fail(

      paymentId,

    );


    set({

      payments:

        paymentService.getPayments(),

    });


  },


}));