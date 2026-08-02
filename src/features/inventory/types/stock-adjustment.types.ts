export interface StockAdjustmentInput {

  id: string;

  tenantId: string;

  storeId: string;

  productId: string;

  quantity: number;

  adjustmentType: "INCREASE" | "DECREASE";

  reason?: string;

  adjustedBy: string;

  adjustedAt: string;

  warehouseId?: string;

  newQuantity?: number;

}


export interface StockAdjustmentResult {

  id: string;

  tenantId: string;

  storeId: string;

  productId: string;

  quantity: number;

  adjustmentType: "INCREASE" | "DECREASE";

  reason?: string;

  adjustedBy: string;

  adjustedAt: string;

  previousQuantity?: number;

  newQuantity?: number;

  difference?: number;

}


export type StockAdjustment = StockAdjustmentInput;