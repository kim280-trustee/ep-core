import type {
  SaleStatus,
} from "./sale-status.types";

import type {
  SaleItem,
} from "./sale-item.types";

export type SalePaymentStatus =
  | "PENDING"
  | "PAID"
  | "REFUNDED";

export interface Sale {
  id: string;

  tenantId: string;

  storeId: string;

  warehouseId: string;

  customerId?: string;

  cashierId?: string;

  saleNumber: string;

  status: SaleStatus;

  items: SaleItem[];

  subtotal: number;

  discountAmount: number;

  taxAmount: number;

  totalAmount: number;

  paymentStatus: SalePaymentStatus;

  paymentMethod?: string;

  completedAt?: string;

  createdAt: string;

  updatedAt: string;
}
