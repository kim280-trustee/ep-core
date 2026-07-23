import type {
  Customer,
} from "../types/customer.types";


import type {
  ICustomerRepository,
} from "./customer.repository";



class InMemoryCustomerRepository
  implements ICustomerRepository {



  private customers: Customer[] = [];



  findAll(): Customer[] {

    return this.customers;

  }



  findById(
    id: string,
  ): Customer | undefined {

    return this.customers.find(
      (customer) =>
        customer.id === id,
    );

  }



  create(
    customer: Customer,
  ): Customer {

    this.customers.push(
      customer,
    );

    return customer;

  }



  update(
    id: string,
    updates: Partial<Customer>,
  ): Customer | undefined {


    const index =
      this.customers.findIndex(
        (customer) =>
          customer.id === id,
      );



    if (index === -1) {

      return undefined;

    }



    this.customers[index] = {

      ...this.customers[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };



    return this.customers[index];

  }



  delete(
    id: string,
  ): boolean {


    const index =
      this.customers.findIndex(
        (customer) =>
          customer.id === id,
      );



    if (index === -1) {

      return false;

    }



    this.customers.splice(
      index,
      1,
    );


    return true;

  }


}



export const inMemoryCustomerRepository =
  new InMemoryCustomerRepository();