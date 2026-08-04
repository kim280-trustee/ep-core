import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";



interface PurchaseTotals {

  subtotal: number;

  taxAmount: number;

  totalAmount: number;

}



class PurchaseOrderCalculationEngine {



  calculate(

    items: PurchaseOrderItem[],

  ): PurchaseTotals {



    const subtotal =

      items.reduce(

        (

          total,

          item,

        ) =>

          total +

          item.lineTotal,

        0,

      );




    const taxAmount =

      items.reduce(

        (

          total,

          item,

        ) =>

          total +

          (

            item.lineTotal *

            item.taxRate

          ),

        0,

      );




    const totalAmount =

      subtotal +

      taxAmount;



    return {

      subtotal,

      taxAmount,

      totalAmount,

    };


  }




  calculateLineTotal(

    item: PurchaseOrderItem,

  ): number {


    return (

      item.quantityOrdered *

      item.unitCost

    );


  }



}



export const purchaseOrderCalculationEngine =

  new PurchaseOrderCalculationEngine();