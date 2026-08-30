/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Repository
 * ============================================================
 */

import type {
  InventoryRecord,
} from "../types/inventory-record.types";


export interface IInventoryRepository {

  findAllAsync(
    tenantId: string,
  ): Promise<InventoryRecord[]>;


  findByIdAsync(
    tenantId: string,
    id: string,
  ): Promise<InventoryRecord | null>;


  findByProductAsync(
    tenantId: string,
    productId: string,
  ): Promise<InventoryRecord[]>;


  findByWarehouseAsync(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryRecord[]>;


  findByProductAndWarehouseAsync(
    tenantId: string,
    productId: string,
    warehouseId: string,
  ): Promise<InventoryRecord | null>;


  createAsync(
    record: InventoryRecord,
  ): Promise<InventoryRecord>;


  updateAsync(
    tenantId: string,
    id: string,
    updates: Partial<InventoryRecord>,
  ): Promise<InventoryRecord>;

}
