/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Service
 * ============================================================
 */


import type {

  CreateSupplierDto,

  UpdateSupplierDto,

} from "../types/supplier.types";


import {
  supplierRepository,
} from "../repositories/repository.provider";



export const supplierService = {


  getSuppliers() {

    return supplierRepository.findAll();

  },



  getSupplierById(
    id: string,
  ) {

    return supplierRepository.findById(
      id,
    );

  },



  createSupplier(
    tenantId: string,

    storeId: string,

    supplier: Omit<
      CreateSupplierDto,
      "tenantId"
      | "storeId"
    >,

  ) {


    return supplierRepository.create({

      ...supplier,

      tenantId,

      storeId,

    });

  },



  updateSupplier(
    id: string,

    supplier: UpdateSupplierDto,

  ) {

    return supplierRepository.update(

      id,

      supplier,

    );

  },



  deleteSupplier(
    id: string,
  ) {

    return supplierRepository.delete(
      id,
    );

  },


};