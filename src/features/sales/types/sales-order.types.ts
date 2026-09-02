import type {
  SalesOrderStatus,
} from "./sales-order-status.types";

import type {
  SalesOrderItem,
} from "./sales-order-item.types";

export interface SalesOrder {
  id: string;
  tenantId: string;
  storeId: string;
  customerId?: string;
  warehouseId: string;
  orderNumber: string;
  status: SalesOrderStatus;
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
