import type { PaymentMethod } from "./payment-method.types";
import type { PaymentStatus } from "./payment-status.types";

export interface Payment {
  id: string;

  tenantId: string;

  storeId: string;

  saleId: string;

  amount: number;

  method: PaymentMethod;

  status: PaymentStatus;

  currency: string;

  referenceNumber?: string;

  createdAt: string;
}