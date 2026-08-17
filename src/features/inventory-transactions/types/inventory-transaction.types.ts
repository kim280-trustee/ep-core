/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Transaction Types
 * ============================================================
 */

import type {
  MovementType,
} from "./movement-type.types";


export interface InventoryTransaction {

  id: string;

  tenantId: string;

  storeId: string;

  productId: string;

  warehouseId: string;

  movementType: MovementType;

  quantity: number;

  unitCost: number;

  beforeQuantity: number;

  afterQuantity: number;

  referenceType?: string;

  referenceId?: string;

  notes?: string;

  createdAt: string;

}
