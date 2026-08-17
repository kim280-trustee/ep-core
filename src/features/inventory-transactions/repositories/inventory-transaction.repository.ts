import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


export interface InventoryTransactionRepository {

  findAll(
    tenantId: string,
  ): Promise<InventoryTransaction[]>;


  findById(
    tenantId: string,
    id: string,
  ): Promise<InventoryTransaction | null>;


  findByProduct(
    tenantId: string,
    productId: string,
  ): Promise<InventoryTransaction[]>;


  findByWarehouse(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryTransaction[]>;


  create(
    transaction: InventoryTransaction,
  ): Promise<InventoryTransaction>;

}