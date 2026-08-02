import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";



export interface IInventoryTransactionRepository {


  findAll():

    InventoryTransaction[];



  findById(

    id: string,

  ):

    InventoryTransaction | undefined;



  findByProduct(

    productId: string,

  ):

    InventoryTransaction[];



  create(

    transaction: InventoryTransaction,

  ):

    InventoryTransaction;


}