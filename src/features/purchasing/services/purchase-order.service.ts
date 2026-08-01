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

  storeId: string;

  supplierId: string;

  warehouseId: string;

  notes?: string;

}

class PurchaseOrderService {

  createDraft(
    input: CreatePurchaseOrderInput,
  ) {

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
        input.warehouseId,

      orderNumber:
        `PO-${Date.now()}`,

      status:
        "DRAFT",

      items: [],

      subtotal: 0,

      taxAmount: 0,

      totalAmount: 0,

      notes:
        input.notes,

      createdAt:
        now,

      updatedAt:
        now,

    };

    return purchaseOrderRepository.create(
      order,
    );

  }

  getOrders() {

    return purchaseOrderRepository.findAll();

  }

  getOrderById(
    id: string,
  ) {

    return purchaseOrderRepository.findById(
      id,
    );

  }

  update(
    id: string,
    updates: Partial<PurchaseOrder>,
  ) {

    return purchaseOrderRepository.update(
      id,
      updates,
    );

  }

  addItem(
    orderId: string,
    item: PurchaseOrderItem,
  ) {

    const order =
      purchaseOrderRepository.findById(
        orderId,
      );

    if (!order) {

      throw new Error(
        "Purchase order not found.",
      );

    }

    order.items.push(
      item,
    );

    return purchaseOrderRepository.update(
      orderId,
      order,
    );

  }

  submit(
    orderId: string,
  ) {

    return purchaseOrderRepository.update(
      orderId,
      {
        status:
          "SUBMITTED",
      },
    );

  }

  approve(
    orderId: string,
  ) {

    return purchaseOrderRepository.update(
      orderId,
      {
        status:
          "APPROVED",
      },
    );

  }

  cancel(
    orderId: string,
  ) {

    return purchaseOrderRepository.update(
      orderId,
      {
        status:
          "CANCELLED",
      },
    );

  }

  receive(
    orderId: string,
  ) {

    const order =
      purchaseOrderRepository.findById(
        orderId,
      );

    if (!order) {

      throw new Error(
        "Purchase order not found.",
      );

    }

    const updated =
      purchaseReceivingEngine.receive(
        order,
      );

    return purchaseOrderRepository.update(
      order.id,
      updated,
    );

  }

}

export const purchaseOrderService =
  new PurchaseOrderService();