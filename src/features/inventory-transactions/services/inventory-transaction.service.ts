/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Transactions Module
 * ------------------------------------------------------------
 * Inventory Transaction Service
 * ============================================================
 */


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
    record:
      ReturnType<
        typeof inventoryService.getInventoryRecord
      >,
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

    transaction:
      InventoryTransaction,

  ) {


    const record =
      inventoryService.getInventoryRecord(

        transaction.productId,

        transaction.warehouseId,

      );



    if (!record) {

      return;

    }




    const increasingMovements:
      MovementType[] = [


        "INITIAL_STOCK",

        "PURCHASE_RECEIPT",

        "SALE_RETURN",

        "ADJUSTMENT_IN",

        "TRANSFER_IN",


      ];




    const decreasingMovements:
      MovementType[] = [


        "SALE",

        "PURCHASE_RETURN",

        "ADJUSTMENT_OUT",

        "TRANSFER_OUT",


      ];





    if (

      increasingMovements.includes(
        transaction.movementType,
      )

    ) {


      inventoryService.increaseStock(

        record,

        transaction.quantity,

        transaction.unitCost,

      );


      return;

    }






    if (

      decreasingMovements.includes(
        transaction.movementType,
      )

    ) {


      inventoryService.decreaseStock(

        record,

        transaction.quantity,

      );


    }


  }








  getTransactions() {


    return inventoryTransactionRepository.findAll();


  }




}



export const inventoryTransactionService =
  new InventoryTransactionService();