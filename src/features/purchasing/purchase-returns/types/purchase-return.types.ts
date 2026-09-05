import type { PurchaseReturnItem } from "./purchase-return-item.types";
import type { PurchaseReturnStatus } from "./purchase-return-status.types";

export interface PurchaseReturn {
  id: string;
  tenantId: string;
  storeId: string;
  purchaseOrderId: string;
  supplierId: string;
  warehouseId: string;
  returnNumber: string;
  status: PurchaseReturnStatus;
  items: PurchaseReturnItem[];
  totalAmount: number;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}
