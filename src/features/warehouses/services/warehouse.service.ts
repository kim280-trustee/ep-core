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


  getWarehouses() {

    return warehouseRepository.findAll();

  },



  getWarehouseById(
    id:string,
  ) {

    return warehouseRepository.findById(
      id,
    );

  },



  createWarehouse(

    tenantId:string,

    storeId:string,

    warehouse:CreateWarehouseDto,

  ) {


    return warehouseRepository.create({

      ...warehouse,

      tenantId,

      storeId,

    });

  },



  updateWarehouse(

    id:string,

    warehouse:UpdateWarehouseDto,

  ) {


    return warehouseRepository.update(

      id,

      warehouse,

    );

  },



  deleteWarehouse(
    id:string,
  ) {


    return warehouseRepository.delete(
      id,
    );

  },


};