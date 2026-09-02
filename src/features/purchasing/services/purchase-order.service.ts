import {
  purchaseOrderItemRepository,
} from "../repositories";

import {
  purchaseOrderRepository,
} from "../repositories";

import {
  purchaseReceivingEngine,
} from "../engine";

import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


interface CreatePurchaseOrderInput {

  tenantId: string;

  storeId: string | null;

  supplierId: string;

  warehouseId?: string | null;

  notes?: string | null;

}


class PurchaseOrderService {


  async createDraft(
    input: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {

    const now =
      new Date().toISOString();


    const order: PurchaseOrder = {

      id:
        crypto.randomUUID(),

      tenantId:
        input.tenantId,

      storeId:
        input.storeId,

      supplierId:
        input.supplierId,

      warehouseId:
        input.warehouseId ?? null,

      orderNumber:
        `PO-${Date.now()}`,

      orderDate:
        now,

      expectedDeliveryDate:
        null,

      status:
        "DRAFT",

      currency:
        "THB",

      items: [],

      subtotal:
        0,

      taxAmount:
        0,

      totalAmount:
        0,

      notes:
        input.notes ?? null,

      createdBy:
        null,

      createdAt:
        now,

      updatedAt:
        now,

    };


    return purchaseOrderRepository.create(
      order,
    );

  }


  async getOrders(
    tenantId: string,
  ): Promise<PurchaseOrder[]> {

    const orders =
      await purchaseOrderRepository.findAll(
        tenantId,
      );


    return Promise.all(
      orders.map(
        async (order) => {

          const items =
            await purchaseOrderItemRepository.findAll(
              tenantId,
              order.id,
            );


          return {
            ...order,
            items,
          };

        },
      ),
    );

  }


  async getOrderById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrder | undefined> {

    const order =
      await purchaseOrderRepository.findById(
        tenantId,
        id,
      );


    if (!order) {

      return undefined;

    }


    const items =
      await purchaseOrderItemRepository.findAll(
        tenantId,
        id,
      );


    return {

      ...order,

      items,

    };

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {

    const updated =
      await purchaseOrderRepository.update(
        tenantId,
        id,
        updates,
      );


    if (!updated) {

      return undefined;

    }


    const items =
      await purchaseOrderItemRepository.findAll(
        tenantId,
        id,
      );


    return {

      ...updated,

      items,

    };

  }


  async addItem(
    tenantId: string,
    orderId: string,
    item: PurchaseOrderItem,
  ): Promise<PurchaseOrderItem> {

    const order =
      await purchaseOrderRepository.findById(
        tenantId,
        orderId,
      );


    if (!order) {

      throw new Error(
        "Purchase order not found.",
      );

    }


    if (
      order.status !== "DRAFT"
    ) {

      throw new Error(
        "Items can only be added to a draft purchase order.",
      );

    }


    if (
      item.quantity <= 0
    ) {

      throw new Error(
        "Purchase order item quantity must be greater than zero.",
      );

    }


    if (
      item.unitCost < 0
    ) {

      throw new Error(
        "Purchase order item unit cost cannot be negative.",
      );

    }


    const now =
      new Date().toISOString();


    const persistedItem: PurchaseOrderItem = {

      ...item,

      id:
        item.id || crypto.randomUUID(),

      tenantId:
        tenantId,

      purchaseOrderId:
        orderId,

      productId:
        item.productId,

      receivedQuantity:
        item.receivedQuantity ?? 0,

      taxRate:
        item.taxRate ?? 0,

      taxAmount:
        item.taxAmount ?? 0,

      lineTotal:
        item.lineTotal ??
        (
          item.quantity *
          item.unitCost
        ),

      notes:
        item.notes ?? null,

      createdAt:
        item.createdAt || now,

      updatedAt:
        now,

    };


    const saved =
      await purchaseOrderItemRepository.create(
        persistedItem,
      );


    return saved;

  }


  async submit(
    tenantId: string,
    orderId: string,
  ): Promise<PurchaseOrder | undefined> {

    return this.update(
      tenantId,
      orderId,
      {
        status:
          "SUBMITTED",
      },
    );

  }


  async approve(
    tenantId: string,
    orderId: string,
  ): Promise<PurchaseOrder | undefined> {

    return this.update(
      tenantId,
      orderId,
      {
        status:
          "APPROVED",
      },
    );

  }


  async cancel(
    tenantId: string,
    orderId: string,
  ): Promise<PurchaseOrder | undefined> {

    return this.update(
      tenantId,
      orderId,
      {
        status:
          "CANCELLED",
      },
    );

  }


  async receive(
    tenantId: string,
    orderId: string,
  ): Promise<PurchaseOrder | undefined> {

    const order =
      await purchaseOrderRepository.findById(
        tenantId,
        orderId,
      );


    if (!order) {

      throw new Error(
        "Purchase order not found.",
      );

    }


    const persistedItems =
      await purchaseOrderItemRepository.findAll(
        tenantId,
        orderId,
      );


    if (
      persistedItems.length === 0
    ) {

      throw new Error(
        "Purchase order has no persisted items.",
      );

    }


    const orderWithItems: PurchaseOrder = {

      ...order,

      items:
        persistedItems,

    };


    const updated =
      await purchaseReceivingEngine.receive(
        orderWithItems,
      );


    const persisted =
      await purchaseOrderRepository.update(
        tenantId,
        order.id,
        updated,
      );


    if (!persisted) {

      return undefined;

    }


    return {

      ...persisted,

      items:
        persistedItems,

    };

  }

}


export const purchaseOrderService =
  new PurchaseOrderService();
