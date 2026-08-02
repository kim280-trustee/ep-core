import type {
  InventoryRecord,
} from "../../../features/inventory/types/inventory-record.types";


export const sampleInventory: InventoryRecord[] = [

  {

    id: "INV-001",

    tenantId: "DEMO-TENANT",

    productId: "PRODUCT-001",

    warehouseId: "WAREHOUSE-001",

    quantityOnHand: 100,

    reservedQuantity: 0,

    availableQuantity: 100,

    minimumStockLevel: 10,

    averageCost: 50,

    lastMovementAt:
      new Date().toISOString(),

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

  },

];