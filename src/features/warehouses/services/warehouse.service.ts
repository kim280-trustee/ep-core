/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Warehouse Service
 * ============================================================
 */

import type {
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "../types/warehouse.types";


import {
  warehouseRepository,
} from "../repositories/repository.provider";


export const warehouseService = {


  async getWarehouses() {

    return warehouseRepository.findAll();

  },


  async getWarehouseById(
    id: string,
  ) {

    return warehouseRepository.findById(
      id,
    );

  },


  async createWarehouse(
    tenantId: string,
    storeId: string,
    warehouse: CreateWarehouseDto,
  ) {

    return warehouseRepository.create({

      ...warehouse,

      tenantId,

      storeId,

    });

  },


  async updateWarehouse(
    id: string,
    warehouse: UpdateWarehouseDto,
  ) {

    return warehouseRepository.update(
      id,
      warehouse,
    );

  },


  async deleteWarehouse(
    id: string,
  ) {

    return warehouseRepository.delete(
      id,
    );

  },

};
