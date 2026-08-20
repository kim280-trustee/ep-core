import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderRepository,
} from "./purchase-order.repository";


class InMemoryPurchaseOrderRepository
  implements PurchaseOrderRepository {


  private orders: PurchaseOrder[] = [];


  async findAll(
    tenantId: string,
  ): Promise<PurchaseOrder[]> {

    return this.orders.filter(
      (order) =>
        order.tenantId === tenantId,
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrder | undefined> {

    return this.orders.find(
      (order) =>
        order.tenantId === tenantId &&
        order.id === id,
    );

  }


  async findBySupplier(
    tenantId: string,
    supplierId: string,
  ): Promise<PurchaseOrder[]> {

    return this.orders.filter(
      (order) =>
        order.tenantId === tenantId &&
        order.supplierId === supplierId,
    );

  }


  async create(
    order: PurchaseOrder,
  ): Promise<PurchaseOrder> {

    this.orders.push(
      order,
    );

    return order;

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {

    const index =
      this.orders.findIndex(
        (order) =>
          order.tenantId === tenantId &&
          order.id === id,
      );


    if (index === -1) {

      return undefined;

    }


    this.orders[index] = {

      ...this.orders[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };


    return this.orders[index];

  }

}


export const inMemoryPurchaseOrderRepository =
  new InMemoryPurchaseOrderRepository();