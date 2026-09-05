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

    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {

      const lineSubtotal =
        item.quantity *
        item.unitCost;

      const lineTax =
        lineSubtotal *
        (item.taxRate / 100);

      subtotal +=
        lineSubtotal;

      taxAmount +=
        lineTax;
    }

    return {
      subtotal,
      taxAmount,
      totalAmount:
        subtotal +
        taxAmount,
    };
  }


  calculateLine(
    item: PurchaseOrderItem,
  ): {
    taxAmount: number;
    lineTotal: number;
  } {

    const lineSubtotal =
      item.quantity *
      item.unitCost;

    const taxAmount =
      lineSubtotal *
      (item.taxRate / 100);

    return {
      taxAmount,
      lineTotal:
        lineSubtotal +
        taxAmount,
    };
  }


  calculateLineTotal(
    item: PurchaseOrderItem,
  ): number {

    return this.calculateLine(
      item,
    ).lineTotal;
  }
}


export const purchaseOrderCalculationEngine =
  new PurchaseOrderCalculationEngine();
