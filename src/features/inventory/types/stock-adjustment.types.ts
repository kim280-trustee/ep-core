export interface StockAdjustment {
  id: string;

  tenantId: string;

  storeId: string;

  productId: string;

  quantity: number;

  adjustmentType:
    | "INCREASE"
    | "DECREASE";

  reason:
    | "DAMAGED"
    | "EXPIRED"
    | "LOST"
    | "FOUND"
    | "STOCK_COUNT"
    | "MANUAL";

  notes?: string;

  adjustedBy: string;

  adjustedAt: string;
}