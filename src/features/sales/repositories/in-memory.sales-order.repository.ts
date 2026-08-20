import type {
  SalesOrderRepository,
} from "./sales-order.repository";

import type {
  SalesOrder,
} from "../types/sales-order.types";


class InMemorySalesOrderRepository
  implements SalesOrderRepository {

  private orders: SalesOrder[] = [];


  async findAll(
    tenantId: string,
  ): Promise<SalesOrder[]> {

    return this.orders.filter(
      (order) =>
        order.tenantId === tenantId,
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<SalesOrder | undefined> {

    return this.orders.find(
      (order) =>
        order.tenantId === tenantId &&
        order.id === id,
    );

  }


  async create(
    order: SalesOrder,
  ): Promise<SalesOrder> {

    this.orders.push(order);

    return order;

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<SalesOrder>,
  ): Promise<SalesOrder | undefined> {

    const index =
      this.orders.findIndex(
        (order) =>
          order.tenantId === tenantId &&
          order.id === id,
      );


    if (index === -1) {

      return undefined;

    }


    const updatedOrder: SalesOrder = {

      ...this.orders[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };


    this.orders[index] =
      updatedOrder;


    return updatedOrder;

  }

}


export const inMemorySalesOrderRepository =
  new InMemorySalesOrderRepository();
