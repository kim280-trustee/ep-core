export type SupplierPaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "PROMPTPAY"
  | "OTHER";

export type SupplierPaymentStatus = "COMPLETED" | "CANCELLED";

export interface SupplierPayment {
  id: string;
  tenantId: string;
  storeId: string;
  supplierId: string;
  paymentNumber: string;
  amount: number;
  method: SupplierPaymentMethod;
  reference: string | null;
  notes: string | null;
  status: SupplierPaymentStatus;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPaymentDto {
  tenantId: string;
  storeId: string;
  supplierId: string;
  amount: number;
  method: SupplierPaymentMethod;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string;
}
