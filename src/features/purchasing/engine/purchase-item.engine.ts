import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


export class PurchaseItemEngine {


  addItem(

    order: PurchaseOrder,

    item: PurchaseOrderItem,

  ): PurchaseOrder {


    const items = [

      ...order.items,

      item,

    ];


    return {

      ...order,

      items,

      ...this.calculateTotals(

        items,

      ),

    };

  }





  removeItem(

    order: PurchaseOrder,

    itemId: string,

  ): PurchaseOrder {


    const items =

      order.items.filter(

        (item) =>

          item.id !== itemId,

      );


    return {

      ...order,

      items,

      ...this.calculateTotals(

        items,

      ),

    };

  }





  updateQuantity(

    order: PurchaseOrder,

    itemId: string,

    quantity: number,

  ): PurchaseOrder {


    const items =

      order.items.map(

        (item) => {


          if (

            item.id !== itemId

          ) {

            return item;

          }


          const lineTotal =

            quantity *

            item.unitCost;


          return {

            ...item,

            quantityOrdered:

              quantity,

            lineTotal,

          };

        },

      );


    return {

      ...order,

      items,

      ...this.calculateTotals(

        items,

      ),

    };

  }





  updateUnitCost(

    order: PurchaseOrder,

    itemId: string,

    unitCost: number,

  ): PurchaseOrder {


    const items =

      order.items.map(

        (item) => {


          if (

            item.id !== itemId

          ) {

            return item;

          }


          const lineTotal =

            item.quantityOrdered *

            unitCost;


          return {

            ...item,

            unitCost,

            lineTotal,

          };

        },

      );


    return {

      ...order,

      items,

      ...this.calculateTotals(

        items,

      ),

    };

  }





  private calculateTotals(

    items: PurchaseOrderItem[],

  ) {


    const subtotal =

      items.reduce(

        (

          total,

          item,

        ) =>

          total +

          item.quantityOrdered *

          item.unitCost,

        0,

      );


    const taxAmount =

      items.reduce(

        (

          total,

          item,

        ) =>

          total +

          item.lineTotal *

          (

            item.taxRate / 100

          ),

        0,

      );


    return {

      subtotal,

      taxAmount,

      totalAmount:

        subtotal +

        taxAmount,

    };

  }


}


export const purchaseItemEngine =

  new PurchaseItemEngine();