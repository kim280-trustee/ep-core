import type {
  Customer,
} from "../types/customer.types";


export interface ICustomerRepository {

  findAll(
    tenantId: string,
    storeId?: string,
  ): Promise<Customer[]>;


  findById(
    tenantId: string,
    id: string,
  ): Promise<Customer | undefined>;


  create(
    customer: Customer,
  ): Promise<Customer>;


  update(
    tenantId: string,
    id: string,
    updates: Partial<Customer>,
  ): Promise<Customer | undefined>;


  delete(
    tenantId: string,
    id: string,
  ): Promise<boolean>;

}
