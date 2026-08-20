import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


import {
  purchaseOrderCalculationEngine,
} from "./purchase-order-calculation.engine";


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

      ...purchaseOrderCalculationEngine.calculate(
        items,
      ),

      updatedAt:
        new Date().toISOString(),

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

      ...purchaseOrderCalculationEngine.calculate(
        items,
      ),

      updatedAt:
        new Date().toISOString(),

    };

  }


  updateQuantity(
    order: PurchaseOrder,
    itemId: string,
    quantity: number,
  ): PurchaseOrder {

    if (quantity <= 0) {

      throw new Error(
        "Quantity must be greater than zero.",
      );

    }


    const items =
      order.items.map(
        (item) => {

          if (
            item.id !== itemId
          ) {

            return item;

          }


          return {

            ...item,

            quantity,

            lineTotal:
              quantity *
              item.unitCost,

          };

        },
      );


    return {

      ...order,

      items,

      ...purchaseOrderCalculationEngine.calculate(
        items,
      ),

      updatedAt:
        new Date().toISOString(),

    };

  }


  updateUnitCost(
    order: PurchaseOrder,
    itemId: string,
    unitCost: number,
  ): PurchaseOrder {

    if (unitCost < 0) {

      throw new Error(
        "Unit cost cannot be negative.",
      );

    }


    const items =
      order.items.map(
        (item) => {

          if (
            item.id !== itemId
          ) {

            return item;

          }


          return {

            ...item,

            unitCost,

            lineTotal:
              item.quantity *
              unitCost,

          };

        },
      );


    return {

      ...order,

      items,

      ...purchaseOrderCalculationEngine.calculate(
        items,
      ),

      updatedAt:
        new Date().toISOString(),

    };

  }

}


export const purchaseItemEngine =
  new PurchaseItemEngine();