import type {
  SalesOrder,
} from "../types/sales-order.types";


export class SalesValidationEngine {


  validate(
    order: SalesOrder,
  ): void {


    if (!order) {

      throw new Error(
        "Sales order not found.",
      );

    }



    if (

      order.items.length === 0

    ) {

      throw new Error(
        "Sales order has no items.",
      );

    }



    for (const item of order.items) {


      if (

        item.quantity <= 0

      ) {

        throw new Error(
          "Invalid item quantity.",
        );

      }



      if (

        item.unitPrice < 0

      ) {

        throw new Error(
          "Invalid item price.",
        );

      }


    }


  }


}


export const salesValidationEngine =

  new SalesValidationEngine();