export type StockAdjustmentReason =
  | "MANUAL"
  | "DAMAGED"
  | "EXPIRED"
  | "LOST"
  | "FOUND"
  | "STOCK_COUNT";

export interface StockAdjustmentInput {
  id: string;
  tenantId: string;
  storeId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  adjustmentType: "INCREASE" | "DECREASE";
  reason: StockAdjustmentReason;
  adjustedBy: string;
  adjustedAt: string;
  newQuantity?: number;
}

export interface StockAdjustmentResult {
  id: string;
  tenantId: string;
  storeId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  adjustmentType: "INCREASE" | "DECREASE";
  reason: StockAdjustmentReason;
  adjustedBy: string;
  adjustedAt: string;
  previousQuantity?: number;
  newQuantity?: number;
  difference?: number;
}

export type StockAdjustment = StockAdjustmentInput;
