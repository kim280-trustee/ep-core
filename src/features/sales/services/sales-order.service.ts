import {
  salesOrderRepository,
} from "../repositories";

import type {
  SalesOrder,
} from "../types/sales-order.types";

import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";


interface CreateSalesOrderInput {

  tenantId: string;

  storeId: string;

  warehouseId: string;

  customerId?: string;

  notes?: string;

}


class SalesOrderService {


  async createDraft(
    input: CreateSalesOrderInput,
  ): Promise<SalesOrder> {

    const now =
      new Date().toISOString();


    const order: SalesOrder = {

      id:
        crypto.randomUUID(),

      tenantId:
        input.tenantId,

      storeId:
        input.storeId,

      warehouseId:
        input.warehouseId,

      customerId:
        input.customerId,

      orderNumber:
        `SO-${Date.now()}`,

      status:
        "DRAFT",

      items: [],

      subtotal:
        0,

      discountAmount:
        0,

      taxAmount:
        0,

      totalAmount:
        0,

      paymentStatus:
        "UNPAID",

      notes:
        input.notes,

      createdAt:
        now,

      updatedAt:
        now,

    };


    return await salesOrderRepository.create(
      order,
    );

  }


  async getOrders(
    tenantId: string,
  ): Promise<SalesOrder[]> {

    return await salesOrderRepository.findAll(
      tenantId,
    );

  }


  async getOrderById(
    tenantId: string,
    id: string,
  ): Promise<SalesOrder | undefined> {

    return await salesOrderRepository.findById(
      tenantId,
      id,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<SalesOrder>,
  ): Promise<SalesOrder | undefined> {

    return await salesOrderRepository.update(
      tenantId,
      id,
      updates,
    );

  }


  async addItem(
    tenantId: string,
    orderId: string,
    item: SalesOrderItem,
  ): Promise<SalesOrder | undefined> {

    const order =
      await salesOrderRepository.findById(
        tenantId,
        orderId,
      );


    if (!order) {

      throw new Error(
        "Sales order not found.",
      );

    }


    const updatedItems = [
      ...order.items,
      item,
    ];


    const totals =
      this.calculateTotals(
        updatedItems,
      );


    return await salesOrderRepository.update(
      tenantId,
      orderId,
      {
        items:
          updatedItems,

        ...totals,
      },
    );

  }


  async confirm(
    tenantId: string,
    orderId: string,
  ): Promise<SalesOrder | undefined> {

    return await salesOrderRepository.update(
      tenantId,
      orderId,
      {
        status:
          "CONFIRMED",
      },
    );

  }


  async cancel(
    tenantId: string,
    orderId: string,
  ): Promise<SalesOrder | undefined> {

    return await salesOrderRepository.update(
      tenantId,
      orderId,
      {
        status:
          "CANCELLED",
      },
    );

  }


  private calculateTotals(
    items: SalesOrderItem[],
  ) {

    const subtotal =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          (
            item.quantity *
            item.unitPrice
          ),
        0,
      );


    const discountAmount =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.discountAmount,
        0,
      );


    const taxAmount =
      items.reduce(
        (
          total,
          item,
        ) =>
          total +
          (
            item.lineTotal *
            (
              item.taxRate /
              100
            )
          ),
        0,
      );


    return {

      subtotal,

      discountAmount,

      taxAmount,

      totalAmount:
        subtotal -
        discountAmount +
        taxAmount,

    };

  }

}


export const salesOrderService =
  new SalesOrderService();
