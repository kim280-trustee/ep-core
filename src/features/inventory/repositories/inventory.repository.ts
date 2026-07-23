import type {
  InventoryRecord,
} from "../types/inventory-record.types";

export interface IInventoryRepository {

  findAll(): InventoryRecord[];

  findById(
    id: string,
  ): InventoryRecord | undefined;

  findByProduct(
    productId: string,
  ): InventoryRecord[];

  findByWarehouse(
    warehouseId: string,
  ): InventoryRecord[];

  findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): InventoryRecord | undefined;

  create(
    record: InventoryRecord,
  ): InventoryRecord;

  update(
    id: string,
    updates: Partial<InventoryRecord>,
  ): InventoryRecord | undefined;

}