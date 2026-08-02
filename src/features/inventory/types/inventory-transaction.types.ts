export type InventoryTransactionType =

  | "PURCHASE_RECEIPT"

  | "SALE"

  | "RETURN"

  | "TRANSFER"

  | "ADJUSTMENT";



export interface InventoryTransaction {

  id: string;

  tenantId: string;

  storeId?: string;

  warehouseId: string;

  productId: string;

  type: InventoryTransactionType;

  quantity: number;

  beforeQuantity: number;

  afterQuantity: number;

  referenceId?: string;

  note?: string;

  createdAt: string;

}