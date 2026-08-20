import type {
  SalesOrder,
} from "../types/sales-order.types";


export interface SalesOrderRepository {


  findAll(
    tenantId: string,
  ): Promise<SalesOrder[]>;


  findById(
    tenantId: string,
    id: string,
  ): Promise<SalesOrder | undefined>;


  create(
    order: SalesOrder,
  ): Promise<SalesOrder>;


  update(
    tenantId: string,
    id: string,
    updates: Partial<SalesOrder>,
  ): Promise<SalesOrder | undefined>;


}