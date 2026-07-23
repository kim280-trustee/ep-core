import {
  inventoryTransactionService,
} from "../../inventory-transactions/services/inventory-transaction.service";


import type {
  InventoryLedgerEntry,
} from "../types/inventory-ledger.types";



class InventoryLedgerService {



  getLedger(): InventoryLedgerEntry[] {


    return inventoryTransactionService

      .getTransactions()

      .map(

        (transaction) => ({


          id:
            transaction.id,


          productId:
            transaction.productId,


          warehouseId:
            transaction.warehouseId,


          movementType:
            transaction.movementType,


          quantity:
            transaction.quantity,


          unitCost:
            transaction.unitCost,


          referenceType:
            transaction.referenceType,


          referenceId:
            transaction.referenceId,


          createdAt:
            transaction.createdAt,


        }),

      );

  }





  getProductLedger(

    productId: string,

  ) {


    return this.getLedger()

      .filter(

        (entry) =>

          entry.productId === productId,

      );

  }





  getWarehouseLedger(

    warehouseId: string,

  ) {


    return this.getLedger()

      .filter(

        (entry) =>

          entry.warehouseId === warehouseId,

      );

  }



}



export const inventoryLedgerService =
  new InventoryLedgerService();