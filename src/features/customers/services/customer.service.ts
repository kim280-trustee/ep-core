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

    return customerRepository.findById(id);

  }



  createCustomer(

    input: CustomerFormInput,

    tenantId: string,

    storeId: string,

  ): Customer {



    const now =
      new Date().toISOString();



    const customer: Customer = {
  id: this.generateId(),

  tenantId,

  storeId,

  customerCode: `CUST-${Date.now()}`,

  name: input.name,

  phone: input.phone,

  email: input.email,

  address: input.address,

  customerType: input.customerType,

  creditLimit: input.creditLimit,

  status: "ACTIVE",

  createdAt: now,

  updatedAt: now,
};
    return customerRepository.create(
      customer,
    );

  }



  updateCustomer(

    id: string,

    updates: Partial<Customer>,

  ) {


    return customerRepository.update(
      id,
      updates,
    );

  }



  deleteCustomer(
    id: string,
  ): boolean {

    return customerRepository.delete(id);

  }


}



export const customerService =
  new CustomerService();