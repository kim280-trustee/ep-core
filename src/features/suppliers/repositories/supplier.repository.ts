/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Repository Contract
 * ============================================================
 */


import type {

  Supplier,

  CreateSupplierDto,

  UpdateSupplierDto,

} from "../types/supplier.types";



export interface SupplierRepository {


  findAll(): Supplier[];



  findById(
    id: string,
  ): Supplier | undefined;



  create(
    supplier: CreateSupplierDto,
  ): Supplier;



  update(
    id: string,
    supplier: UpdateSupplierDto,
  ): Supplier | undefined;



  delete(
    id: string,
  ): boolean;


}