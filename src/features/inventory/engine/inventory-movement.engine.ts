 /**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Movement Engine
 * ============================================================
 */

import type {
  InventoryRecord,
} from "../types/inventory-record.types";


export interface InventoryMovementInput {

  inventoryId?: string;

  productId: string;

  warehouseId?: string;

  quantity: number;

  movementType: string;

  previousQuantity?: number;

  newQuantity?: number;

  referenceId?: string;

  notes?: string;

}



export interface InventoryMovement {

  id: string;

  inventoryId?: string;

  productId: string;

  warehouseId?: string;

  quantity: number;

  movementType: string;

  previousQuantity?: number;

  newQuantity?: number;

  referenceId?: string;

  notes?: string;

  createdAt: string;

}



class InventoryMovementEngine {


  increase(
    record: InventoryRecord,
    quantity: number,
  ): InventoryRecord {

    return {

      ...record,

      quantityOnHand:
        record.quantityOnHand + quantity,


      availableQuantity:
        record.availableQuantity + quantity,

    };

  }




  decrease(
    record: InventoryRecord,
    quantity: number,
  ): InventoryRecord {

    return {

      ...record,

      quantityOnHand:
        record.quantityOnHand - quantity,


      availableQuantity:
        record.availableQuantity - quantity,

    };

  }




  createMovement(
    input: InventoryMovementInput,
  ): InventoryMovement {


    return {

      id:
        crypto.randomUUID(),


      ...input,


      createdAt:
        new Date()
          .toISOString(),

    };

  }

}



export const inventoryMovementEngine =
new InventoryMovementEngine();