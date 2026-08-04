import type {
  SaleItem,
} from "../../types";


import {
  pricingEngine,
} from "../pricing/pricing.engine";


import {
  paymentEngine,
} from "../payment/payment.engine";


import type {
  PaymentEntry,
} from "../payment/payment.engine";



export class CheckoutEngine {


  checkout(

    items: SaleItem[],

    payments: PaymentEntry[],

    discountRate = 0,

    taxRate = 0,

  ) {


    const pricing =
      pricingEngine.calculate(

        items,

        discountRate,

        taxRate,

      );



    const payment =
      paymentEngine.process(

        pricing.total,

        payments,

      );



    return {


      items,


      pricing,


      payment,


      completed:
        payment.completed,


    };


  }


}



export const checkoutEngine =
  new CheckoutEngine();