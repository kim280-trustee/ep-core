/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Suppliers Module
 * ------------------------------------------------------------
 * Supplier Business Service
 * ============================================================
 */

import {
  supplierRepository,
} from "../repositories";


import {
  SupplierStatus,
} from "../types/supplier.types";


import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from "../types/supplier.types";


class SupplierService {


  private generateId(): string {

    return crypto.randomUUID();

  }


  async getSuppliers(
    tenantId: string,
    storeId?: string,
  ): Promise<Supplier[]> {

    return supplierRepository.findAll(
      tenantId,
      storeId,
    );

  }


  async getSupplierById(
    tenantId: string,
    id: string,
  ): Promise<Supplier | undefined> {

    return supplierRepository.findById(
      tenantId,
      id,
    );

  }


  async createSupplier(
    input: CreateSupplierDto,
    tenantId: string,
    storeId: string,
  ): Promise<Supplier> {

    const now =
      new Date().toISOString();


    const supplier: Supplier = {

      id:
        this.generateId(),

      tenantId,

      storeId,

      name:
        input.name,

      contactPerson:
        input.contactPerson ?? null,

      phone:
        input.phone ?? null,

      email:
        input.email ?? null,

      address:
        input.address ?? null,

      taxId:
        input.taxId ?? null,

      paymentTerms:
        input.paymentTerms ?? null,

      status:
        SupplierStatus.ACTIVE,

      createdAt:
        now,

      updatedAt:
        now,

    };


    return supplierRepository.create(
      supplier,
    );

  }


  async updateSupplier(
    tenantId: string,
    id: string,
    updates: UpdateSupplierDto,
  ): Promise<Supplier | undefined> {

    return supplierRepository.update(
      tenantId,
      id,
      {
        ...updates,
        updatedAt:
          new Date().toISOString(),
      },
    );

  }


  async deleteSupplier(
    tenantId: string,
    id: string,
  ): Promise<boolean> {

    return supplierRepository.delete(
      tenantId,
      id,
    );

  }


}


export const supplierService =
  new SupplierService();
