export interface InventoryRecord {


  id: string;


tenantId: string;


  productId: string;


  warehouseId: string;


  quantityOnHand: number;


  reservedQuantity: number;


  availableQuantity: number;


  averageCost: number;


  minimumStockLevel: number;


  maximumStockLevel?: number;


  lastMovementAt?: string;


  createdAt: string;


  updatedAt: string;


}