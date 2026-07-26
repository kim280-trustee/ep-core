export interface StockTransfer {
  id: string;

  tenantId: string;

  fromStoreId: string;

  toStoreId: string;

  productId: string;

  quantity: number;

  status:
    | "PENDING"
    | "IN_TRANSIT"
    | "COMPLETED"
    | "CANCELLED";

  transferredBy: string;

  receivedBy?: string;

  transferredAt: string;

  receivedAt?: string;

  notes?: string;
}