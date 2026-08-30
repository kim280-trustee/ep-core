import type {
  Supplier,
} from "../types/supplier.types";


import type {
  ISupplierRepository,
} from "./supplier.repository";


class InMemorySupplierRepository
implements ISupplierRepository {


  private suppliers: Supplier[] = [];


  async findAll(
    tenantId: string,
    storeId?: string,
  ): Promise<Supplier[]> {

    return this.suppliers.filter(
      (supplier) =>
        supplier.tenantId === tenantId &&
        (
          storeId === undefined ||
          supplier.storeId === storeId
        ),
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<Supplier | undefined> {

    return this.suppliers.find(
      (supplier) =>
        supplier.tenantId === tenantId &&
        supplier.id === id,
    );

  }


  async create(
    supplier: Supplier,
  ): Promise<Supplier> {

    this.suppliers.push(
      supplier,
    );

    return supplier;

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<Supplier>,
  ): Promise<Supplier | undefined> {

    const index =
      this.suppliers.findIndex(
        (supplier) =>
          supplier.tenantId === tenantId &&
          supplier.id === id,
      );


    if (index === -1) {

      return undefined;

    }


    this.suppliers[index] = {

      ...this.suppliers[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };


    return this.suppliers[index];

  }


  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {

    const index =
      this.suppliers.findIndex(
        (supplier) =>
          supplier.tenantId === tenantId &&
          supplier.id === id,
      );


    if (index === -1) {

      return false;

    }


    this.suppliers.splice(
      index,
      1,
    );


    return true;

  }

}


export const inMemorySupplierRepository =
  new InMemorySupplierRepository();
