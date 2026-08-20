import type {
  PurchaseOrderStatus,
} from "./purchase-order-status.types";


import type {
  PurchaseOrderItem,
} from "./purchase-order-item.types";


export interface PurchaseOrder {

  id: string;

  tenantId: string;

  storeId: string | null;

  supplierId: string;

  warehouseId: string | null;

  orderNumber: string;

  orderDate: string;

  expectedDeliveryDate: string | null;

  status: PurchaseOrderStatus;

  currency: string;

  items: PurchaseOrderItem[];

  subtotal: number;

  taxAmount: number;

  totalAmount: number;

  notes: string | null;

  createdBy: string | null;

  createdAt: string;

  updatedAt: string;

}