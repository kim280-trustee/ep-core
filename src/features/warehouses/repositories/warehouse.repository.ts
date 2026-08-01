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


  findAll(): Warehouse[];



  findById(
    id: string,
  ): Warehouse | undefined;



  create(
    warehouse: CreateWarehouseDto & {

      tenantId: string;

      storeId: string;

    },
  ): Warehouse;



  update(

    id: string,

    warehouse: UpdateWarehouseDto,

  ): Warehouse | undefined;



  delete(
    id: string,
  ): boolean;


}