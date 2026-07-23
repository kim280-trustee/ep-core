import type {
  PurchaseOrderStatus,
} from "./purchase-order-status.types";


import type {
  PurchaseOrderItem,
} from "./purchase-order-item.types";



export interface PurchaseOrder {


  id: string;


  tenantId: string;


  storeId: string;


  supplierId: string;


  warehouseId: string;


  orderNumber: string;


  status: PurchaseOrderStatus;


  items: PurchaseOrderItem[];


  subtotal: number;


  taxAmount: number;


  totalAmount: number;


  notes?: string;


  createdAt: string;


  updatedAt: string;


}