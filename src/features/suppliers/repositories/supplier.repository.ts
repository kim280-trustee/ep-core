import type {
  Supplier,
} from "../types/supplier.types";


export interface ISupplierRepository {


  findAll(): Supplier[];


  findById(
    id: string,
  ): Supplier | undefined;



  create(
    supplier: Supplier,
  ): Supplier;



  update(
    id: string,
    updates: Partial<Supplier>,
  ): Supplier | undefined;



  delete(
    id: string,
  ): boolean;

}