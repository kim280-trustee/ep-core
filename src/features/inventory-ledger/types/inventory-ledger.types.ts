import type {
  MovementType,
} from "../../inventory-transactions/types/movement-type.types";


export interface InventoryLedgerEntry {

  id: string;

  productId: string;

  productName?: string;

  warehouseId: string;

  warehouseName?: string;

  movementType: MovementType;

  quantity: number;

  unitCost: number;

  referenceType?: string;

  referenceId?: string;

  createdAt: string;

}
