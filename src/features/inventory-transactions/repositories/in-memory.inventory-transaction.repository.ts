import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


import type {
  InventoryTransactionRepository,
} from "./inventory-transaction.repository";


class InMemoryInventoryTransactionRepository
implements InventoryTransactionRepository {


  private transactions:
    InventoryTransaction[] = [];



  findAll() {

    return this.transactions;

  }



  findById(
    id: string,
  ) {

    return this.transactions.find(
      (transaction) =>
        transaction.id === id,
    );

  }



  findByProduct(
    productId: string,
  ) {

    return this.transactions.filter(
      (transaction) =>
        transaction.productId === productId,
    );

  }



  findByWarehouse(
    warehouseId: string,
  ) {

    return this.transactions.filter(
      (transaction) =>
        transaction.warehouseId === warehouseId,
    );

  }



  create(
    transaction: InventoryTransaction,
  ) {

    this.transactions.push(
      transaction,
    );


    return transaction;

  }


}


export const inMemoryInventoryTransactionRepository =
  new InMemoryInventoryTransactionRepository();