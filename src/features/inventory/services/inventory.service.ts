/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Service
 * ============================================================
 */

import type {
  InventoryRecord,
} from "../types/inventory-record.types";

import {
  inventoryRepository,
} from "../repositories/repository.provider";


class InventoryService {


  async getInventory(
    tenantId: string,
  ): Promise<InventoryRecord[]> {

    return inventoryRepository.findAllAsync(
      tenantId,
    );

  }


  async getInventoryRecord(
    tenantId: string,
    productId: string,
    warehouseId: string,
  ): Promise<InventoryRecord | null> {

    return inventoryRepository
      .findByProductAndWarehouseAsync(
        tenantId,
        productId,
        warehouseId,
      );

  }


  async getInventoryByProduct(
    tenantId: string,
    productId: string,
  ): Promise<InventoryRecord[]> {

    return inventoryRepository
      .findByProductAsync(
        tenantId,
        productId,
      );

  }


  async getInventoryByWarehouse(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryRecord[]> {

    return inventoryRepository
      .findByWarehouseAsync(
        tenantId,
        warehouseId,
      );

  }


  async createInventoryRecord(
    record: InventoryRecord,
  ): Promise<InventoryRecord> {

    return inventoryRepository.createAsync(
      record,
    );

  }


  async increaseStock(
    record: InventoryRecord,
    quantity: number,
    incomingCost: number,
  ): Promise<InventoryRecord> {

    if (quantity <= 0) {

      throw new Error(
        "Stock quantity must be greater than zero.",
      );

    }


    const currentQuantity =
      record.quantityOnHand;

    const currentAverageCost =
      record.averageCost;

    const newQuantity =
      currentQuantity +
      quantity;

    const newAverageCost =
      newQuantity === 0
        ? incomingCost
        : (
            (
              currentQuantity *
              currentAverageCost
            ) +
            (
              quantity *
              incomingCost
            )
          ) /
          newQuantity;


    return inventoryRepository.updateAsync(

      record.tenantId,

      record.id,

      {

        quantityOnHand:
          newQuantity,

        averageCost:
          newAverageCost,

        lastMovementAt:
          new Date().toISOString(),

      },

    );

  }


  async decreaseStock(
    record: InventoryRecord,
    quantity: number,
  ): Promise<InventoryRecord> {

    if (quantity <= 0) {

      throw new Error(
        "Stock quantity must be greater than zero.",
      );

    }


    if (
      record.availableQuantity <
      quantity
    ) {

      throw new Error(
        "Insufficient available stock.",
      );

    }


    const newQuantity =
      record.quantityOnHand -
      quantity;


    return inventoryRepository.updateAsync(

      record.tenantId,

      record.id,

      {

        quantityOnHand:
          newQuantity,

        lastMovementAt:
          new Date().toISOString(),

      },

    );

  }


  async updateInventory(
    tenantId: string,
    id: string,
    updates: Partial<InventoryRecord>,
  ): Promise<InventoryRecord> {

    return inventoryRepository.updateAsync(

      tenantId,

      id,

      updates,

    );

  }

}


export const inventoryService =
  new InventoryService();
