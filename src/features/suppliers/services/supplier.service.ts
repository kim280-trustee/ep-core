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
} from "../types/supplier.types";

import type {
  SupplierFormInput,
} from "../validators/supplier.schema";

class SupplierService {

  private generateId(): string {

    return crypto.randomUUID();

  }

  getSuppliers(): Supplier[] {

    return supplierRepository.findAll();

  }

  getSupplierById(
    id: string,
  ): Supplier | undefined {

    return supplierRepository.findById(
      id,
    );

  }

  createSupplier(

    input: SupplierFormInput,

    tenantId: string,

    storeId: string,

  ): Supplier {

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

  updateSupplier(

    id: string,

    updates: Partial<Supplier>,

  ): Supplier | undefined {

    return supplierRepository.update(

      id,

      {

        ...updates,

        updatedAt:
          new Date().toISOString(),

      },

    );

  }

  deleteSupplier(
    id: string,
  ): boolean {

    return supplierRepository.delete(
      id,
    );

  }

}

export const supplierService =
  new SupplierService();