import {
  supplierRepository,
} from "../repositories";


import type {
  Supplier,
} from "../types/supplier.types";


import type {
  SupplierFormInput,
} from "../validators/supplier.schema";



class SupplierService {



  generateId(): string {

    return crypto.randomUUID();

  }



  getSuppliers(): Supplier[] {

    return supplierRepository.findAll();

  }



  getSupplierById(
    id: string,
  ): Supplier | undefined {

    return supplierRepository.findById(id);

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
        input.contactPerson,


      phone:
        input.phone,


      email:
        input.email,


      address:
        input.address,


      taxId:
        input.taxId,


      status:
        "active",


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

  ) {


    return supplierRepository.update(
      id,
      updates,
    );

  }



  deleteSupplier(
    id: string,
  ): boolean {

    return supplierRepository.delete(id);

  }


}



export const supplierService =
  new SupplierService();