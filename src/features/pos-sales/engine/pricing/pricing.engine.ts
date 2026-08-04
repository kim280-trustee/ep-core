import type {
  SaleItem,
} from "../../types";


export interface PricingSummary {

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  total: number;

}


export class PricingEngine {


  calculate(

    items: SaleItem[],

    discountRate = 0,

    taxRate = 0,

  ): PricingSummary {


    const subtotal =
      items.reduce(

        (sum, item) =>
          sum + item.lineTotal,

        0,

      );



    const discountAmount =
      subtotal *
      discountRate;



    const taxableAmount =
      subtotal -
      discountAmount;



    const taxAmount =
      taxableAmount *
      taxRate;



    const total =
      taxableAmount +
      taxAmount;



    return {

      subtotal,

      discountAmount,

      taxAmount,

      total,

    };

  }


}


export const pricingEngine =
  new PricingEngine();