import type {
  Customer,
} from "../types/customer.types";

import type {
  ICustomerRepository,
} from "./customer.repository";


class InMemoryCustomerRepository
  implements ICustomerRepository {

  private customers: Customer[] = [];


  async findAll(
    tenantId: string,
    storeId?: string,
  ): Promise<Customer[]> {

    return this.customers.filter(
      (customer) =>
        customer.tenantId === tenantId &&
        (!storeId ||
          customer.storeId === storeId),
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<Customer | undefined> {

    return this.customers.find(
      (customer) =>
        customer.tenantId === tenantId &&
        customer.id === id,
    );

  }


  async create(
    customer: Customer,
  ): Promise<Customer> {

    this.customers.push(
      customer,
    );

    return customer;

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<Customer>,
  ): Promise<Customer | undefined> {

    const index =
      this.customers.findIndex(
        (customer) =>
          customer.tenantId === tenantId &&
          customer.id === id,
      );


    if (index === -1) {

      return undefined;

    }


    const updated: Customer = {

      ...this.customers[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };


    this.customers[index] =
      updated;


    return updated;

  }


  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {

    const originalLength =
      this.customers.length;


    this.customers =
      this.customers.filter(
        (customer) =>
          !(
            customer.tenantId === tenantId &&
            customer.id === id
          ),
      );


    return (
      this.customers.length <
      originalLength
    );

  }

}


export const inMemoryCustomerRepository =
  new InMemoryCustomerRepository();
