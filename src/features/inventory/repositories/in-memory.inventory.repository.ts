import type {
  InventoryRecord,
} from "../types/inventory-record.types";

import type {
  IInventoryRepository,
} from "./inventory.repository";

class InMemoryInventoryRepository
  implements IInventoryRepository {

  private records: InventoryRecord[] = [];

  findAll(): InventoryRecord[] {

    return this.records;

  }

  findById(
    id: string,
  ) {

    return this.records.find(
      (record) => record.id === id,
    );

  }

  findByProduct(
    productId: string,
  ) {

    return this.records.filter(
      (record) =>
        record.productId === productId,
    );

  }

  findByWarehouse(
    warehouseId: string,
  ) {

    return this.records.filter(
      (record) =>
        record.warehouseId === warehouseId,
    );

  }

  findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ) {

    return this.records.find(
      (record) =>
        record.productId === productId &&
        record.warehouseId === warehouseId,
    );

  }

  create(
    record: InventoryRecord,
  ) {

    this.records.push(record);

    return record;

  }

  update(
    id: string,
    updates: Partial<InventoryRecord>,
  ) {

    const index =
      this.records.findIndex(
        (record) =>
          record.id === id,
      );

    if (index === -1) {

      return undefined;

    }

    this.records[index] = {

      ...this.records[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };

    return this.records[index];

  }

}

export const inMemoryInventoryRepository =
  new InMemoryInventoryRepository();