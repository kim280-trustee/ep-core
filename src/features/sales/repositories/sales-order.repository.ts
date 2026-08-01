import type {
  SalesOrder,
} from "../types/sales-order.types";


export interface SalesOrderRepository {


  findAll(): SalesOrder[];



  findById(
    id: string,
  ): SalesOrder | undefined;



  create(
    order: SalesOrder,
  ): SalesOrder;



  update(
    id: string,

    updates: Partial<SalesOrder>,

  ): SalesOrder | undefined;



}