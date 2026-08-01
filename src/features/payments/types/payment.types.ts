export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "QR"
  | "BANK_TRANSFER";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: string;

  tenantId: string;

  salesOrderId: string;

  method: PaymentMethod;

  amount: number;

  status: PaymentStatus;

  reference?: string;

  createdAt: string;

  updatedAt: string;
}