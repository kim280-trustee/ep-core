import type {
  InventoryRecord,
} from "../types/inventory-record.types";


export type InventoryMovementType =

  | "PURCHASE_RECEIPT"

  | "SALE"

  | "RETURN"

  | "TRANSFER"

  | "ADJUSTMENT";



export interface InventoryMovement {

  id: string;

  productId: string;

  warehouseId: string;

  type: InventoryMovementType;

  quantity: number;

  previousQuantity: number;

  newQuantity: number;

  referenceId?: string;

  createdAt: string;

}



export class InventoryMovementEngine {


  increase(

    record: InventoryRecord,

    quantity: number,

  ): InventoryRecord {


    if (quantity <= 0) {

      throw new Error(
        "Quantity must be greater than zero.",
      );

    }


    return {

      ...record,

      quantityOnHand:

        record.quantityOnHand +

        quantity,

      availableQuantity:

        record.availableQuantity +

        quantity,

      lastMovementAt:

        new Date().toISOString(),

    };

  }





  decrease(

    record: InventoryRecord,

    quantity: number,

  ): InventoryRecord {


    if (

      record.quantityOnHand < quantity

    ) {

      throw new Error(
        "Insufficient stock.",
      );

    }


    return {

      ...record,

      quantityOnHand:

        record.quantityOnHand -

        quantity,

      availableQuantity:

        record.availableQuantity -

        quantity,

      lastMovementAt:

        new Date().toISOString(),

    };

  }





  createMovement(

    input: Omit<InventoryMovement, "id" | "createdAt">,

  ): InventoryMovement {


    return {

      id:

        crypto.randomUUID(),

      ...input,

      createdAt:

        new Date().toISOString(),

    };

  }


}


export const inventoryMovementEngine =

  new InventoryMovementEngine();