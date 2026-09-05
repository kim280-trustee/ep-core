import {
  purchaseOrderItemRepository,
  purchaseOrderRepository,
} from "../repositories";

import {
  purchaseOrderCalculationEngine,
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
  currency?: string;
  notes?: string | null;
}


class PurchaseOrderService {

  private async hydrate(
    tenantId: string,
    order: PurchaseOrder,
  ): Promise<PurchaseOrder> {

    const items =
      await purchaseOrderItemRepository.findAll(
        tenantId,
        order.id,
      );

    return {
      ...order,
      items,
    };
  }


  private validateCurrency(
    currency: string,
  ): string {

    const normalized =
      currency.trim().toUpperCase();

    if (!normalized) {
      throw new Error(
        "Currency is required.",
      );
    }

    return normalized;
  }


  private calculateOrder(
    order: PurchaseOrder,
    items: PurchaseOrderItem[],
  ): PurchaseOrder {

    const totals =
      purchaseOrderCalculationEngine.calculate(
        items,
      );

    return {
      ...order,
      items,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      updatedAt: new Date().toISOString(),
    };
  }


  async createDraft(
    input: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {

    if (!input.tenantId) {
      throw new Error(
        "Tenant ID is required.",
      );
    }

    if (!input.supplierId) {
      throw new Error(
        "Supplier is required.",
      );
    }

    const now =
      new Date().toISOString();

    const currency =
      this.validateCurrency(
        input.currency ?? "THB",
      );

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

      currency,

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
        (order) =>
          this.hydrate(
            tenantId,
            order,
          ),
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

    return this.hydrate(
      tenantId,
      order,
    );
  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {

    const existing =
      await purchaseOrderRepository.findById(
        tenantId,
        id,
      );

    if (!existing) {
      return undefined;
    }

    const allowedStatuses =
      new Set([
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "CANCELLED",
      ]);

    if (
      updates.status &&
      !allowedStatuses.has(
        updates.status,
      )
    ) {
      throw new Error(
        "Invalid purchase order status.",
      );
    }

    const updated =
      await purchaseOrderRepository.update(
        tenantId,
        id,
        {
          ...updates,
          updatedAt:
            new Date().toISOString(),
        },
      );

    if (!updated) {
      return undefined;
    }

    return this.hydrate(
      tenantId,
      updated,
    );
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

    if (order.status !== "DRAFT") {
      throw new Error(
        "Items can only be added to a draft purchase order.",
      );
    }

    if (!item.productId) {
      throw new Error(
        "Product is required.",
      );
    }

    if (item.quantity <= 0) {
      throw new Error(
        "Purchase order item quantity must be greater than zero.",
      );
    }

    if (item.unitCost < 0) {
      throw new Error(
        "Purchase order item unit cost cannot be negative.",
      );
    }

    if (item.taxRate < 0) {
      throw new Error(
        "Purchase order item tax rate cannot be negative.",
      );
    }

    const now =
      new Date().toISOString();

    const taxRate =
      item.taxRate ?? 0;

    const lineSubtotal =
      item.quantity *
      item.unitCost;

    const taxAmount =
      lineSubtotal *
      (taxRate / 100);

    const lineTotal =
      lineSubtotal +
      taxAmount;

    const persistedItem: PurchaseOrderItem = {
      ...item,

      id:
        item.id ||
        crypto.randomUUID(),

      tenantId:
        tenantId,

      purchaseOrderId:
        orderId,

      receivedQuantity:
        0,

      taxRate,

      taxAmount,

      lineTotal,

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

    const items =
      await purchaseOrderItemRepository.findAll(
        tenantId,
        orderId,
      );

    const recalculated =
      this.calculateOrder(
        {
          ...order,
          items,
        },
        items,
      );

    await purchaseOrderRepository.update(
      tenantId,
      orderId,
      {
        subtotal:
          recalculated.subtotal,

        taxAmount:
          recalculated.taxAmount,

        totalAmount:
          recalculated.totalAmount,

        updatedAt:
          recalculated.updatedAt,
      },
    );

    return saved;
  }


  async submit(
    tenantId: string,
    orderId: string,
  ): Promise<PurchaseOrder | undefined> {

    const order =
      await this.getOrderById(
        tenantId,
        orderId,
      );

    if (!order) {
      throw new Error(
        "Purchase order not found.",
      );
    }

    if (order.status !== "DRAFT") {
      throw new Error(
        "Only draft purchase orders can be submitted.",
      );
    }

    if (order.items.length === 0) {
      throw new Error(
        "A purchase order must contain at least one item before submission.",
      );
    }

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

    const order =
      await this.getOrderById(
        tenantId,
        orderId,
      );

    if (!order) {
      throw new Error(
        "Purchase order not found.",
      );
    }

    if (order.status !== "SUBMITTED") {
      throw new Error(
        "Only submitted purchase orders can be approved.",
      );
    }

    if (order.items.length === 0) {
      throw new Error(
        "A purchase order must contain at least one item before approval.",
      );
    }

    if (!order.warehouseId) {
      throw new Error(
        "A warehouse is required before approving a purchase order.",
      );
    }

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

    const order =
      await this.getOrderById(
        tenantId,
        orderId,
      );

    if (!order) {
      throw new Error(
        "Purchase order not found.",
      );
    }

    if (
      order.status !== "DRAFT" &&
      order.status !== "SUBMITTED" &&
      order.status !== "APPROVED"
    ) {
      throw new Error(
        "This purchase order cannot be cancelled.",
      );
    }

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
      await this.getOrderById(
        tenantId,
        orderId,
      );

    if (!order) {
      throw new Error(
        "Purchase order not found.",
      );
    }

    if (
      order.status !== "APPROVED" &&
      order.status !== "PARTIALLY_RECEIVED"
    ) {
      throw new Error(
        "Only approved or partially received purchase orders can be received.",
      );
    }

    if (!order.warehouseId) {
      throw new Error(
        "A warehouse is required before receiving goods.",
      );
    }

    const updated =
      await purchaseReceivingEngine.receive(
        order,
      );

    for (
      const item of updated.items
    ) {
      await purchaseOrderItemRepository.update(
        tenantId,
        item.id,
        {
          receivedQuantity:
            item.receivedQuantity,

          updatedAt:
            item.updatedAt,
        },
      );
    }

    const totals =
      purchaseOrderCalculationEngine.calculate(
        updated.items,
      );

    const persisted =
      await purchaseOrderRepository.update(
        tenantId,
        orderId,
        {
          status:
            updated.status,

          subtotal:
            totals.subtotal,

          taxAmount:
            totals.taxAmount,

          totalAmount:
            totals.totalAmount,

          updatedAt:
            updated.updatedAt,
        },
      );

    if (!persisted) {
      return undefined;
    }

    return {
      ...persisted,
      items:
        updated.items,
    };
  }
}


export const purchaseOrderService =
  new PurchaseOrderService();

