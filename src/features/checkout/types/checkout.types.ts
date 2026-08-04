export type CheckoutPaymentMethod =
  | "CASH"
  | "CARD"
  | "QR"
  | "BANK_TRANSFER";


export interface CheckoutRequest {

  tenantId: string;

  salesOrderId: string;

  paymentMethod: CheckoutPaymentMethod;

  paymentAmount: number;

}


export interface CheckoutResult {

  salesOrderId: string;

  paymentId: string;

  receiptId: string;

  completedAt: string;

}