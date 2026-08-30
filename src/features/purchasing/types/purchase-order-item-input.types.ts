import type { PurchaseOrderItem } from "./purchase-order-item.types";

export interface CreatePurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
  taxRate?: number;
  notes?: string | null;
}

export interface UpdatePurchaseOrderItemInput {
  quantity?: number;
  unitCost?: number;
  taxRate?: number;
  notes?: string | null;
}

export type PurchaseOrderItemInput = CreatePurchaseOrderItemInput;

export type { PurchaseOrderItem };
