import type {
  InventoryRecord,
} from "../types/inventory-record.types";

import type {
  IInventoryRepository,
} from "./inventory.repository";


class InMemoryInventoryRepository
  implements IInventoryRepository {

  private records: InventoryRecord[] = [];


  async findAllAsync(
    tenantId: string,
  ): Promise<InventoryRecord[]> {

    return this.records.filter(
      (record) =>
        record.tenantId === tenantId,
    );

  }


  async findByIdAsync(
    tenantId: string,
    id: string,
  ): Promise<InventoryRecord | null> {

    return (
      this.records.find(
        (record) =>
          record.tenantId === tenantId &&
          record.id === id,
      ) ??
      null
    );

  }


  async findByProductAsync(
    tenantId: string,
    productId: string,
  ): Promise<InventoryRecord[]> {

    return this.records.filter(
      (record) =>
        record.tenantId === tenantId &&
        record.productId === productId,
    );

  }


  async findByWarehouseAsync(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryRecord[]> {

    return this.records.filter(
      (record) =>
        record.tenantId === tenantId &&
        record.warehouseId === warehouseId,
    );

  }


  async findByProductAndWarehouseAsync(
    tenantId: string,
    productId: string,
    warehouseId: string,
  ): Promise<InventoryRecord | null> {

    return (
      this.records.find(
        (record) =>
          record.tenantId === tenantId &&
          record.productId === productId &&
          record.warehouseId === warehouseId,
      ) ??
      null
    );

  }


  async createAsync(
    record: InventoryRecord,
  ): Promise<InventoryRecord> {

    this.records.push(record);

    return record;

  }


  async updateAsync(
    tenantId: string,
    id: string,
    updates: Partial<InventoryRecord>,
  ): Promise<InventoryRecord> {

    const index =
      this.records.findIndex(
        (record) =>
          record.tenantId === tenantId &&
          record.id === id,
      );

    if (index === -1) {
      throw new Error(
        `Inventory record not found: ${id}`,
      );
    }

    const updatedRecord: InventoryRecord = {
      ...this.records[index],
      ...updates,
      updatedAt:
        new Date().toISOString(),
    };

    this.records[index] =
      updatedRecord;

    return updatedRecord;

  }

}


export const inMemoryInventoryRepository =
  new InMemoryInventoryRepository();

