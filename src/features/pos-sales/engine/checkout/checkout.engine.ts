import type {
  SaleItem,
} from "../../types";

import {
  pricingEngine,
} from "../pricing/pricing.engine";

import {
  paymentEngine,
} from "../payment/payment.engine";


export class CheckoutEngine {

  checkout(

    items: SaleItem[],

    amountPaid: number,

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

        amountPaid,

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