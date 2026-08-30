import type { CreatePurchaseOrderItemInput } from "../types/purchase-order-item-input.types";
import { purchaseOrderItemService } from "./purchase-order-item.service";
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

    return purchaseOrderRepository.findAll(
      tenantId,
    );

  }


  async getOrderById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrder | undefined> {

    return purchaseOrderRepository.findById(
      tenantId,
      id,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {

    return purchaseOrderRepository.update(
      tenantId,
      id,
      updates,
    );

  }


  async addItem(
    tenantId: string,
    orderId: string,
    input: CreatePurchaseOrderItemInput,
  ): Promise<PurchaseOrderItem> {

    const order =
      await purchaseOrderRepository.findById(
        tenantId,
        orderId,
      );

    if (!order) {
      throw new Error("Purchase order not found.");
    }

    if (
      order.status !== "DRAFT"
    ) {
      throw new Error(
        "Items can only be added to a draft purchase order.",
      );
    }

    const item =
      await purchaseOrderItemService.create(input);

    return item;
  }
  async submit(
    tenantId: string,
    orderId: string,
  ): Promise<PurchaseOrder | undefined> {

    return purchaseOrderRepository.update(
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

    return purchaseOrderRepository.update(
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

    return purchaseOrderRepository.update(
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
      await purchaseOrderItemService.getItems(
        tenantId,
        orderId,
      );

    const orderWithItems: PurchaseOrder = {
      ...order,
      items: persistedItems,
    };
const updated =
      await purchaseReceivingEngine.receive(
        orderWithItems,
      );


    return purchaseOrderRepository.update(
      tenantId,
      order.id,
      updated,
    );

  }

}


export const purchaseOrderService =
  new PurchaseOrderService();








