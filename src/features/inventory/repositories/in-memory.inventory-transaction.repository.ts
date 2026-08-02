import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


import type {
  IInventoryTransactionRepository,
} from "./inventory-transaction.repository";



class InMemoryInventoryTransactionRepository

implements IInventoryTransactionRepository {



  private transactions:

    InventoryTransaction[] = [];





  findAll():

    InventoryTransaction[] {

    return [

      ...this.transactions,

    ];

  }





  findById(

    id: string,

  ):

    InventoryTransaction | undefined {


    return this.transactions.find(

      (transaction) =>

        transaction.id === id,

    );


  }





  findByProduct(

    productId: string,

  ):

    InventoryTransaction[] {


    return this.transactions.filter(

      (transaction) =>

        transaction.productId === productId,

    );


  }





  create(

    transaction: InventoryTransaction,

  ):

    InventoryTransaction {


    this.transactions.push(

      transaction,

    );


    return transaction;


  }


}



export const inMemoryInventoryTransactionRepository =

  new InMemoryInventoryTransactionRepository();