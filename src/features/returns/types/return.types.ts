import type { ReturnItem } from "./return-item.types";
import type { ReturnStatus } from "./return-status.types";

export interface Return {
  id: string;

  tenantId: string;

  storeId: string;

  warehouseId: string;

  saleId: string;

  returnNumber: string;

  status: ReturnStatus;

  items: ReturnItem[];

  subtotal: number;

  refundAmount: number;

  createdAt: string;

  updatedAt: string;
}