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
  CreateCustomerDto,
  UpdateCustomerDto,
} from "../types/customer.types";


class CustomerService {


  private generateId(): string {

    return crypto.randomUUID();

  }


  async getCustomers(
    tenantId: string,
    storeId?: string,
  ): Promise<Customer[]> {

    return customerRepository.findAll(
      tenantId,
      storeId,
    );

  }


  async getCustomerById(
    tenantId: string,
    id: string,
  ): Promise<Customer | undefined> {

    return customerRepository.findById(
      tenantId,
      id,
    );

  }


  async createCustomer(
    input: CreateCustomerDto,
    tenantId: string,
    storeId: string,
  ): Promise<Customer> {

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

      status: "active",

      createdAt:
        now,

      updatedAt:
        now,

    };


    return customerRepository.create(
      customer,
    );

  }


  async updateCustomer(
    tenantId: string,
    id: string,
    updates: UpdateCustomerDto,
  ): Promise<Customer | undefined> {

    return customerRepository.update(
      tenantId,
      id,
      {
        ...updates,
        updatedAt:
          new Date().toISOString(),
      },
    );

  }


  async deleteCustomer(
    tenantId: string,
    id: string,
  ): Promise<boolean> {

    return customerRepository.delete(
      tenantId,
      id,
    );

  }


}


export const customerService =
  new CustomerService();

