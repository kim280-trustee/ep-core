/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Customers Module
 * ------------------------------------------------------------
 * Customer Business Service
 * ============================================================
 */


import {
  customerRepository,
} from "../repositories";


import type {
  Customer,
} from "../types/customer.types";


import type {
  CustomerFormInput,
} from "../validators/customer.schema";



class CustomerService {



  generateId(): string {

    return crypto.randomUUID();

  }





  getCustomers(): Customer[] {

    return customerRepository.findAll();

  }





  getCustomerById(

    id: string,

  ): Customer | undefined {

    return customerRepository.findById(

      id,

    );

  }





  createCustomer(

    input: CustomerFormInput,

    tenantId: string,

    storeId: string,

  ): Customer {


    const now =
      new Date().toISOString();



    const customer: Customer = {


      id:
        this.generateId(),



      tenantId,



      storeId,



      name:
        input.name,



      customerType:
        input.customerType,



      phone:
        input.phone ?? null,



      email:
        input.email ?? null,



      address:
        input.address ?? null,



      taxNumber:
        input.taxNumber ?? null,



      creditLimit:
        input.creditLimit ?? null,



      status:
        "active",



      createdAt:
        now,



      updatedAt:
        now,


    };



    return customerRepository.create(

      customer,

    );

  }





  updateCustomer(

    id: string,

    updates: Partial<Customer>,

  ): Customer | undefined {


    return customerRepository.update(

      id,

      {

        ...updates,


        updatedAt:
          new Date().toISOString(),

      },

    );

  }





  deleteCustomer(

    id: string,

  ): boolean {


    return customerRepository.delete(

      id,

    );

  }


}





export const customerService =

  new CustomerService();