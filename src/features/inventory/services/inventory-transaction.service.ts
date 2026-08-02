import {
  inventoryTransactionContext,
} from "../repositories/inventory-transaction.context";


import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";



class InventoryTransactionService {



  getTransactions() {


    return inventoryTransactionContext

      .repository

      .findAll();


  }





  createTransaction(

    transaction: InventoryTransaction,

  ) {


    return inventoryTransactionContext

      .repository

      .create(

        transaction,

      );


  }





  getProductTransactions(

    productId: string,

  ) {


    return inventoryTransactionContext

      .repository

      .findByProduct(

        productId,

      );


  }





  getTransactionById(

    id: string,

  ) {


    return inventoryTransactionContext

      .repository

      .findById(

        id,

      );


  }


}



export const inventoryTransactionService =

  new InventoryTransactionService();