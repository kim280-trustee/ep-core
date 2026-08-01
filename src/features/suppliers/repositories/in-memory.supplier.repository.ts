/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * In Memory Supplier Repository
 * ============================================================
 */


import {
  v4 as uuid,
} from "uuid";


import type {

  Supplier,

  CreateSupplierDto,

  UpdateSupplierDto,

} from "../types/supplier.types";


import type {

  SupplierRepository,

} from "./supplier.repository";



class InMemorySupplierRepository
implements SupplierRepository {


  private suppliers: Supplier[] = [];



  findAll(): Supplier[] {

    return this.suppliers;

  }



  findById(
    id: string,
  ) {

    return this.suppliers.find(

      supplier =>
        supplier.id === id,

    );

  }



  create(
    supplier: CreateSupplierDto,
  ): Supplier {


    const item: Supplier = {


      id: uuid(),


      ...supplier,


      status:
        "ACTIVE",


      createdAt:
        new Date(),


      updatedAt:
        new Date(),


    };



    this.suppliers.push(
      item,
    );



    return item;

  }



  update(
    id: string,
    supplier: UpdateSupplierDto,
  ) {


    const existing =
      this.findById(
        id,
      );



    if (!existing) {

      return undefined;

    }



    Object.assign(

      existing,

      supplier,

      {

        updatedAt:
          new Date(),

      },

    );



    return existing;

  }



  delete(
    id: string,
  ) {


    const index =
      this.suppliers.findIndex(

        item =>
          item.id === id,

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