import type {
  Customer,
} from "../types/customer.types";


export interface ICustomerRepository {


  findAll(): Customer[];


  findById(
    id: string,
  ): Customer | undefined;



  create(
    customer: Customer,
  ): Customer;



  update(
    id: string,
    updates: Partial<Customer>,
  ): Customer | undefined;



  delete(
    id: string,
  ): boolean;

}