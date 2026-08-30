/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Warehouse Repository Contract
 * ============================================================
 */

import type {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "../types/warehouse.types";


export interface WarehouseRepository {


  findAll(): Promise<Warehouse[]>;


  findById(
    id: string,
  ): Promise<Warehouse | undefined>;


  create(
    warehouse: CreateWarehouseDto & {
      tenantId: string;
      storeId: string;
    },
  ): Promise<Warehouse>;


  update(
    id: string,
    warehouse: UpdateWarehouseDto,
  ): Promise<Warehouse | undefined>;


  delete(
    id: string,
  ): Promise<boolean>;


}
