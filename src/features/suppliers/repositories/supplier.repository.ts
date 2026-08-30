import type {
  Supplier,
} from "../types/supplier.types";


export interface ISupplierRepository {


  findAll(
    tenantId: string,
    storeId?: string,
  ): Promise<Supplier[]>;


  findById(
    tenantId: string,
    id: string,
  ): Promise<Supplier | undefined>;


  create(
    supplier: Supplier,
  ): Promise<Supplier>;


  update(
    tenantId: string,
    id: string,
    updates: Partial<Supplier>,
  ): Promise<Supplier | undefined>;


  delete(
    tenantId: string,
    id: string,
  ): Promise<boolean>;


}
