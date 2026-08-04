import type {
  SaleItem,
} from "../../types";


import type {
  PricingSummary,
} from "../pricing/pricing.engine";


import type {
  PaymentResult,
} from "../payment/payment.engine";



export interface Receipt {


  receiptNo: string;


  date: string;


  items: SaleItem[];


  pricing: PricingSummary;


  payment: PaymentResult;


}



class ReceiptEngine {


  generate(

    items: SaleItem[],

    pricing: PricingSummary,

    payment: PaymentResult,

  ): Receipt {


    return {


      receiptNo:

        `RCPT-${Date.now()}`,


      date:

        new Date()
          .toISOString(),


      items,


      pricing,


      payment,


    };


  }


}


export const receiptEngine =
  new ReceiptEngine();