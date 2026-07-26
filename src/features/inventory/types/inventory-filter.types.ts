export interface InventoryFilter {
  search?: string;

  productId?: string;

  storeId?: string;

  warehouseId?: string;

  status?:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK"
    | "OVERSTOCKED";

  includeZeroStock?: boolean;
}