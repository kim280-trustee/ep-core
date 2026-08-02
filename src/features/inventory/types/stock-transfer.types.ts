export interface StockTransferInput {

  id: string;

  tenantId: string;

  fromStoreId: string;

  toStoreId: string;

  productId: string;

  quantity: number;

  status: string;

  transferredBy: string;

  transferredAt: string;

  sourceWarehouseId?: string;

  destinationWarehouseId?: string;

  reason?: string;

}


export interface StockTransferResult {

  id: string;

  tenantId: string;

  fromStoreId: string;

  toStoreId: string;

  productId: string;

  quantity: number;

  status: string;

  transferredBy: string;

  transferredAt: string;

  sourceWarehouseId?: string;

  destinationWarehouseId?: string;

}


export type StockTransfer = StockTransferInput;