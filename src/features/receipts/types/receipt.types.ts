export type ReceiptStatus =
  | "ISSUED"
  | "VOID";

export interface Receipt {

  id: string;

  tenantId: string;

  salesOrderId: string;

  paymentId: string;

  receiptNumber: string;

  totalAmount: number;

  status: ReceiptStatus;

  createdAt: string;

  updatedAt: string;

}