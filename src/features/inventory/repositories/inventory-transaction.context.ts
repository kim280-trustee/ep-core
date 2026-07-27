import {
  inMemoryInventoryTransactionRepository,
} from "./in-memory.inventory-transaction.repository";


export const inventoryTransactionContext = {

  repository:

    inMemoryInventoryTransactionRepository,

};