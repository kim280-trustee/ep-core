export interface StockTransferInput {
  id: string;
  tenantId: string;
  fromStoreId: string;
  toStoreId: string;
  productId: string;
  quantity: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  transferredBy: string;
  transferredAt: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  reason?: string;
}

export interface StockTransferResult {
  id: string;
  tenantId: string;
  fromStoreId: string;
  toStoreId: string;
  productId: string;
  quantity: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  transferredBy: string;
  transferredAt: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  reason?: string;
}

export type StockTransfer = StockTransferInput;
