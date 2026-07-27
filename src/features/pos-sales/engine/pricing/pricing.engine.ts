import type {
  SaleItem,
} from "../../types";


export interface PricingSummary {

  subtotal: number;

  discount: number;

  tax: number;

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


    const discount =
      subtotal * discountRate;


    const taxable =
      subtotal - discount;


    const tax =
      taxable * taxRate;


    const total =
      taxable + tax;


    return {

      subtotal,

      discount,

      tax,

      total,

    };

  }

}


export const pricingEngine =
  new PricingEngine();