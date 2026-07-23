import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


export interface InventoryTransactionRepository {


  findAll(): InventoryTransaction[];


  findById(
    id: string,
  ): InventoryTransaction | undefined;


  findByProduct(
    productId: string,
  ): InventoryTransaction[];


  findByWarehouse(
    warehouseId: string,
  ): InventoryTransaction[];


  create(
    transaction: InventoryTransaction,
  ): InventoryTransaction;


}