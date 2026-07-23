import {
  inventoryTransactionRepository,
} from "../repositories";


import {
  inventoryService,
} from "../../inventory/services/inventory.service";


import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


import type {
  MovementType,
} from "../types/movement-type.types";



interface CreateInventoryTransactionInput {

  tenantId: string;

  storeId: string;

  productId: string;

  warehouseId: string;

  movementType: MovementType;

  quantity: number;

  unitCost: number;

  referenceType?: string;

  referenceId?: string;

  notes?: string;

}



class InventoryTransactionService {



  createTransaction(
    input: CreateInventoryTransactionInput,
  ) {


    this.validateQuantity(
      input.quantity,
    );


    const record =
      inventoryService.getInventoryRecord(

        input.productId,

        input.warehouseId,

      );



    this.validateInventoryRecord(
      record,
    );



    this.validateStockAvailability(

      input.movementType,

      input.quantity,

      record?.quantityOnHand ?? 0,

    );



    const transaction:
      InventoryTransaction = {


      id:
        crypto.randomUUID(),


      tenantId:
        input.tenantId,


      storeId:
        input.storeId,


      productId:
        input.productId,


      warehouseId:
        input.warehouseId,


      movementType:
        input.movementType,


      quantity:
        input.quantity,


      unitCost:
        input.unitCost,


      referenceType:
        input.referenceType,


      referenceId:
        input.referenceId,


      notes:
        input.notes,


      createdAt:
        new Date().toISOString(),

    };



    this.applyInventoryChange(
      transaction,
    );



    return inventoryTransactionRepository.create(
      transaction,
    );

  }





  private validateQuantity(
    quantity: number,
  ) {


    if (quantity <= 0) {

      throw new Error(
        "Inventory quantity must be greater than zero.",
      );

    }

  }





  private validateInventoryRecord(
    record: unknown,
  ) {


    if (!record) {

      throw new Error(
        "Inventory record does not exist for this product and warehouse.",
      );

    }

  }





  private validateStockAvailability(

    movementType: MovementType,

    quantity: number,

    currentStock: number,

  ) {


    const decreasingMovements:
      MovementType[] = [

        "SALE",

        "PURCHASE_RETURN",

        "TRANSFER_OUT",

        "ADJUSTMENT_OUT",

      ];



    if (

      decreasingMovements.includes(
        movementType,
      )

      &&

      currentStock < quantity

    ) {

      throw new Error(
        "Insufficient stock available.",
      );

    }

  }





  private applyInventoryChange(
    transaction: InventoryTransaction,
  ) {


    const record =
      inventoryService.getInventoryRecord(

        transaction.productId,

        transaction.warehouseId,

      );



    if (!record) {

      return;

    }



    switch (
      transaction.movementType
    ) {



      case "INITIAL_STOCK":

      case "PURCHASE_RECEIPT":

      case "SALE_RETURN":

      case "ADJUSTMENT_IN":

      case "TRANSFER_IN":

        inventoryService.increaseStock(

          record,

          transaction.quantity,

          transaction.unitCost,

        );

        break;



      case "SALE":

      case "PURCHASE_RETURN":

      case "ADJUSTMENT_OUT":

      case "TRANSFER_OUT":

        inventoryService.decreaseStock(

          record,

          transaction.quantity,

        );

        break;


    }

  }





  getTransactions() {

    return inventoryTransactionRepository.findAll();

  }


}



export const inventoryTransactionService =
  new InventoryTransactionService();