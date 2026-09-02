import type {
  Payment,
} from "@/features/payments/types/payment.types";

import type {
  SalesOrder,
} from "@/features/sales/types/sales-order.types";

import type {
  SalesOrderItem,
} from "@/features/sales/types/sales-order-item.types";


export interface Receipt {
  saleId: string;

  saleNumber: string;

  items: SalesOrderItem[];

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  totalAmount: number;

  paymentStatus:
    | "UNPAID"
    | "PARTIALLY_PAID"
    | "PAID"
    | "REFUNDED";

  paymentMethod?: Payment["method"];

  paymentAmount?: number;

  cashReceived?: number;

  changeAmount?: number;

  paymentProvider?: string;

  paymentReference?: string;

  createdAt: string;
}


class ReceiptEngine {

  generate(
    order: SalesOrder,
    payment?: Payment,
    cashReceived?: number,
  ): Receipt {

    const paymentAmount =
      payment?.amount;

    const actualCashReceived =
      payment?.method === "CASH" &&
      cashReceived !== undefined
        ? cashReceived
        : undefined;

    const changeAmount =
      actualCashReceived !== undefined
        ? Math.max(
            0,
            actualCashReceived -
              order.totalAmount,
          )
        : undefined;

    return {
      saleId:
        order.id,

      saleNumber:
        order.orderNumber,

      items:
        [...order.items],

      subtotal:
        order.subtotal,

      discountAmount:
        order.discountAmount,

      taxAmount:
        order.taxAmount,

      totalAmount:
        order.totalAmount,

      paymentStatus:
        order.paymentStatus,

      paymentMethod:
        payment?.method,

      paymentAmount,

      cashReceived:
        actualCashReceived,

      changeAmount,

      paymentProvider:
        payment?.provider,

      paymentReference:
        payment?.reference,

      createdAt:
        order.createdAt,
    };

  }

}


export const receiptEngine =
  new ReceiptEngine();
