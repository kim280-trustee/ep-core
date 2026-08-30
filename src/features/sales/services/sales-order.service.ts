import {
  getSalesOrderRepository,
} from "../repositories";

import type {
  SalesOrder,
} from "../types/sales-order.types";

import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";

import {
  canCancelSalesOrder,
  canConfirmSalesOrder,
  canProcessSalesOrder,
  canCompleteSalesOrder,
  canRefundSalesOrder,
} from "../types/sales-order-status.types";

import {
  salesEngine,
} from "../engine/sales.engine";

import {
  inventoryTransactionService,
} from "@/features/inventory-transactions/services/inventory-transaction.service";

import {
  inventoryService,
} from "@/features/inventory/services/inventory.service";

interface CreateSalesOrderInput {
  tenantId: string;
  storeId: string;
  warehouseId: string;
  customerId?: string;
  notes?: string;
}

interface AddSalesOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRate?: number;
}

class SalesOrderService {

  async createDraft(
    input: CreateSalesOrderInput,
  ): Promise<SalesOrder> {

    this.requireId(
      input.tenantId,
      "Tenant ID",
    );

    this.requireId(
      input.storeId,
      "Store ID",
    );

    this.requireId(
      input.warehouseId,
      "Warehouse ID",
    );

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
        `SO-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,

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

    return getSalesOrderRepository()
      .create(order);
  }

  async addItem(
    orderId: string,
    input: AddSalesOrderItemInput,
  ): Promise<SalesOrder> {

    const order =
      await this.getRequiredOrder(
        orderId,
      );

    if (order.status !== "DRAFT") {
      throw new Error(
        "Items can only be added to a draft sales order.",
      );
    }

    const quantity =
      Number(input.quantity);

    const unitPrice =
      Number(input.unitPrice);

    const discountAmount =
      Number(
        input.discountAmount ?? 0,
      );

    const taxRate =
      Number(
        input.taxRate ?? 0,
      );

    if (!input.productId.trim()) {
      throw new Error(
        "Product ID is required.",
      );
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        "Quantity must be greater than zero.",
      );
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new Error(
        "Unit price must be zero or greater.",
      );
    }

    if (
      !Number.isFinite(discountAmount) ||
      discountAmount < 0
    ) {
      throw new Error(
        "Discount amount must be zero or greater.",
      );
    }

    if (
      !Number.isFinite(taxRate) ||
      taxRate < 0 ||
      taxRate > 100
    ) {
      throw new Error(
        "Tax rate must be between 0 and 100.",
      );
    }

    const existingIndex =
      order.items.findIndex(
        (item) =>
          item.productId ===
          input.productId,
      );

    let items =
      [...order.items];

    const itemId =
      crypto.randomUUID();

    const rawItem: SalesOrderItem = {
      id:
        itemId,

      salesOrderId:
        order.id,

      productId:
        input.productId,

      quantity,

      unitPrice,

      discountAmount,

      taxRate,

      lineTotal:
        0,
    };

    const calculated =
      salesEngine.calculateItem(
        rawItem,
      );

    if (existingIndex === -1) {
      items.push(
        calculated,
      );
    } else {
      const existing =
        items[existingIndex];

      const merged: SalesOrderItem = {
        ...existing,

        quantity:
          existing.quantity +
          calculated.quantity,

        discountAmount:
          existing.discountAmount +
          calculated.discountAmount,

        unitPrice:
          calculated.unitPrice,

        taxRate:
          calculated.taxRate,
      };

      items[existingIndex] =
        salesEngine.calculateItem(
          merged,
        );
    }

    const totals =
      salesEngine.calculateOrder(
        items,
      );

    const updated =
      await getSalesOrderRepository()
        .update(
          order.tenantId,
          order.id,
          {
            items,
            ...totals,
          },
        );

    if (!updated) {
      throw new Error(
        "Sales order could not be updated.",
      );
    }

    return updated;
  }

  async confirmOrder(
    orderId: string,
  ): Promise<SalesOrder> {

    const order =
      await this.getRequiredOrder(
        orderId,
      );

    if (
      !canConfirmSalesOrder(
        order.status,
      )
    ) {
      throw new Error(
        `Sales order cannot be confirmed from status ${order.status}.`,
      );
    }

    if (order.items.length === 0) {
      throw new Error(
        "A sales order must contain at least one item before confirmation.",
      );
    }

    const totals =
      salesEngine.calculateOrder(
        order.items,
      );

    const updated =
      await getSalesOrderRepository()
        .update(
          order.tenantId,
          order.id,
          {
            status:
              "CONFIRMED",

            ...totals,
          },
        );

    if (!updated) {
      throw new Error(
        "Sales order could not be confirmed.",
      );
    }

    return updated;
  }

  async processOrder(
    orderId: string,
  ): Promise<SalesOrder> {

    const order =
      await this.getRequiredOrder(
        orderId,
      );

    if (
      !canProcessSalesOrder(
        order.status,
      )
    ) {
      throw new Error(
        `Sales order cannot be processed from status ${order.status}.`,
      );
    }

    const updated =
      await getSalesOrderRepository()
        .update(
          order.tenantId,
          order.id,
          {
            status:
              "PROCESSING",
          },
        );

    if (!updated) {
      throw new Error(
        "Sales order could not be moved to processing.",
      );
    }

    return updated;
  }

  async completeOrder(
    orderId: string,
  ): Promise<SalesOrder> {

    const order =
      await this.getRequiredOrder(
        orderId,
      );

    if (
      !canCompleteSalesOrder(
        order.status,
      )
    ) {
      throw new Error(
        `Sales order cannot be completed from status ${order.status}.`,
      );
    }

    if (order.items.length === 0) {
      throw new Error(
        "A sales order must contain at least one item before completion.",
      );
    }

    /*
     * Inventory must be deducted exactly once for this sale.
     *
     * A completed sales order may be encountered again by the UI,
     * so check for existing SALE transactions using the sales order
     * ID before creating any new stock movement.
     */
    const existingTransactions =
      await inventoryTransactionService.getTransactions(
        order.tenantId,
      );

    const existingSaleProductIds =
      new Set(
        existingTransactions
          .filter(
            (transaction) =>
              transaction.movementType === "SALE" &&
              transaction.referenceType === "SALE" &&
              transaction.referenceId === order.id,
          )
          .map(
            (transaction) =>
              transaction.productId,
          ),
      );

    /*
     * Pre-check every item before changing stock.
     * This prevents a partial deduction when one item does not
     * have enough available stock.
     */
    for (const item of order.items) {

      if (
        existingSaleProductIds.has(
          item.productId,
        )
      ) {
        continue;
      }

      const record =
        await inventoryTransactionService.getProductTransactions(
          item.productId,
          order.tenantId,
        );

      const alreadySoldForThisOrder =
        record.some(
          (transaction) =>
            transaction.movementType === "SALE" &&
            transaction.referenceType === "SALE" &&
            transaction.referenceId === order.id,
        );

      if (alreadySoldForThisOrder) {
        continue;
      }

      const inventoryRecord =
        await inventoryService.getInventoryRecord(
          order.tenantId,
          item.productId,
          order.warehouseId,
        );

      if (!inventoryRecord) {
        throw new Error(
          `Inventory record not found for product ${item.productId}.`,
        );
      }

      if (
        inventoryRecord.availableQuantity <
        item.quantity
      ) {
        throw new Error(
          `Insufficient stock for product ${item.productId}. Available: ${inventoryRecord.availableQuantity}, required: ${item.quantity}.`,
        );
      }
    }

    /*
     * Deduct stock for every item.
     */
    for (const item of order.items) {

      const productTransactions =
        await inventoryTransactionService.getProductTransactions(
          item.productId,
          order.tenantId,
        );

      const alreadySold =
        productTransactions.some(
          (transaction) =>
            transaction.movementType === "SALE" &&
            transaction.referenceType === "SALE" &&
            transaction.referenceId === order.id,
        );

      if (alreadySold) {
        continue;
      }

      await inventoryTransactionService.sellStock(
        item.productId,
        order.warehouseId,
        item.quantity,
        order.id,
        `Sale completed: ${order.orderNumber}`,
      );
    }

    const totals =
      salesEngine.calculateOrder(
        order.items,
      );

    const updated =
      await getSalesOrderRepository()
        .update(
          order.tenantId,
          order.id,
          {
            status:
              "COMPLETED",

            paymentStatus:
              "PAID",

            ...totals,
          },
        );

    if (!updated) {
      throw new Error(
        "Sales order could not be completed.",
      );
    }

    return updated;
  }

  async cancelOrder(
    orderId: string,
  ): Promise<SalesOrder> {

    const order =
      await this.getRequiredOrder(
        orderId,
      );

    if (
      !canCancelSalesOrder(
        order.status,
      )
    ) {
      throw new Error(
        `Sales order cannot be cancelled from status ${order.status}.`,
      );
    }

    const updated =
      await getSalesOrderRepository()
        .update(
          order.tenantId,
          order.id,
          {
            status:
              "CANCELLED",
          },
        );

    if (!updated) {
      throw new Error(
        "Sales order could not be cancelled.",
      );
    }

    return updated;
  }

  async refundOrder(
    orderId: string,
  ): Promise<SalesOrder> {

    const order =
      await this.getRequiredOrder(
        orderId,
      );

    if (
      !canRefundSalesOrder(
        order.status,
      )
    ) {
      throw new Error(
        `Sales order cannot be refunded from status ${order.status}.`,
      );
    }

    const updated =
      await getSalesOrderRepository()
        .update(
          order.tenantId,
          order.id,
          {
            status:
              "REFUNDED",
          },
        );

    if (!updated) {
      throw new Error(
        "Sales order could not be refunded.",
      );
    }

    return updated;
  }

  async getOrders(
    tenantId: string,
  ): Promise<SalesOrder[]> {

    this.requireId(
      tenantId,
      "Tenant ID",
    );

    return getSalesOrderRepository()
      .findAll(
        tenantId,
      );
  }

  async getOrderById(
    tenantId: string,
    orderId: string,
  ): Promise<SalesOrder | undefined> {

    this.requireId(
      tenantId,
      "Tenant ID",
    );

    this.requireId(
      orderId,
      "Sales order ID",
    );

    return getSalesOrderRepository()
      .findById(
        tenantId,
        orderId,
      );
  }

  private async getRequiredOrder(
    orderId: string,
  ): Promise<SalesOrder> {

    this.requireId(
      orderId,
      "Sales order ID",
    );

    const context =
      await this.getContext();

    const order =
      await getSalesOrderRepository()
        .findById(
          context.tenantId,
          orderId,
        );

    if (!order) {
      throw new Error(
        "Sales order not found.",
      );
    }

    if (
      order.storeId !==
      context.storeId
    ) {
      throw new Error(
        "Sales order does not belong to the current store.",
      );
    }

    return order;
  }

  private async getContext(): Promise<{
    tenantId: string;
    storeId: string;
  }> {

    const {
      storeContext,
    } = await import(
      "@/core/store/store.context"
    );

    const context =
      storeContext.getStore();

    if (!context?.tenantId) {
      throw new Error(
        "Tenant context is not initialized.",
      );
    }

    if (!context.storeId) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    return {
      tenantId:
        context.tenantId,

      storeId:
        context.storeId,
    };
  }

  private requireId(
    value: string,
    label: string,
  ): void {

    if (
      !value ||
      !value.trim()
    ) {
      throw new Error(
        `${label} is required.`,
      );
    }
  }
}

export const salesOrderService =
  new SalesOrderService();
