import type {
  Sale,
} from "../../types/sale.types";

import type {
  SaleItem,
} from "../../types/sale-item.types";

export interface Receipt {
  saleId: string;

  saleNumber: string;

  items: SaleItem[];

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  totalAmount: number;

  paymentStatus:
    | "UNPAID"
    | "PARTIALLY_PAID"
    | "PAID"
    | "REFUNDED";

  createdAt: string;
}

class ReceiptEngine {
  generate(
    sale: Sale,
  ): Receipt {
    return {
      saleId:
        sale.id,

      saleNumber:
        sale.saleNumber,

      items:
        [...sale.items],

      subtotal:
        sale.subtotal,

      discountAmount:
        sale.discountAmount,

      taxAmount:
        sale.taxAmount,

      totalAmount:
        sale.totalAmount,

      paymentStatus: sale.paymentStatus === "PENDING" ? "UNPAID" : sale.paymentStatus === "PAID" ? "PAID" : "REFUNDED",

      createdAt:
        sale.createdAt,
    };
  }
}

export const receiptEngine =
  new ReceiptEngine();
