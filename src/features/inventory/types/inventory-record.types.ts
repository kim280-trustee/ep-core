export interface InventoryRecord {

  id: string;

  tenantId: string;

  storeId: string;

  productId: string;

  warehouseId: string;

  quantityOnHand: number;

  reservedQuantity: number;

  availableQuantity: number;

  reorderLevel: number;

  reorderQuantity: number;

  averageCost: number;

  lastMovementAt: string;

  createdAt: string;

  updatedAt: string;

}