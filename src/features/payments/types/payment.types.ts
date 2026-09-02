export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "QR"
  | "MOBILE_MONEY"
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

  provider?: string;

  amount: number;

  status: PaymentStatus;

  reference?: string;

  createdAt: string;

  updatedAt: string;
}
