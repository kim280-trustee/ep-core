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


  async findAll(
    tenantId: string,
  ): Promise<InventoryTransaction[]> {

    return this.transactions.filter(
      (transaction) =>
        transaction.tenantId === tenantId,
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<InventoryTransaction | null> {

    return (
      this.transactions.find(
        (transaction) =>
          transaction.tenantId === tenantId &&
          transaction.id === id,
      ) ??
      null
    );

  }


  async findByProduct(
    tenantId: string,
    productId: string,
  ): Promise<InventoryTransaction[]> {

    return this.transactions.filter(
      (transaction) =>
        transaction.tenantId === tenantId &&
        transaction.productId === productId,
    );

  }


  async findByWarehouse(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryTransaction[]> {

    return this.transactions.filter(
      (transaction) =>
        transaction.tenantId === tenantId &&
        transaction.warehouseId === warehouseId,
    );

  }


  async create(
    transaction: InventoryTransaction,
  ): Promise<InventoryTransaction> {

    this.transactions.push(
      transaction,
    );

    return transaction;

  }

}


export const inMemoryInventoryTransactionRepository =
  new InMemoryInventoryTransactionRepository();