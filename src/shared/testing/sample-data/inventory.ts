import type {
  InventoryRecord,
} from "../../../features/inventory/types/inventory-record.types";

export const sampleInventory: InventoryRecord[] = [

  {

    id: crypto.randomUUID(),

    tenantId: "DEMO-TENANT",

    storeId: "DEMO-STORE",

    warehouseId: "DEMO-WAREHOUSE",

    productId: "",

    quantityOnHand: 100,

    reservedQuantity: 0,

    availableQuantity: 100,

    averageCost: 15,

    reorderLevel: 10,

    reorderQuantity: 50,

    lastMovementAt: new Date().toISOString(),

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

  },

];