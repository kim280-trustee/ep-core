import {
  purchaseOrderRepository,
  purchaseOrderItemRepository,
} from "@/features/purchasing/repositories";

import { inventoryTransactionService } from "@/features/inventory-transactions/services/inventory-transaction.service";

import {
  getGoodsReceiptRepository,
} from "../repositories/repository.provider";

import type {
  GoodsReceipt,
  GoodsReceiptItem,
} from "../types/goods-receipt.types";

export interface CreateGoodsReceiptInput {
  id?: string;
  tenantId: string;
  storeId: string;
  purchaseOrderId: string;
  supplierId: string;
  warehouseId: string;
  items: Array<{
    id?: string;
    purchaseOrderItemId: string;
    productId: string;
    quantityReceived: number;
    unitCost?: number;
  }>;
  receivedBy?: string;
  notes?: string;
}

class GoodsReceiptService {
  async getReceipts(
    tenantId: string,
  ): Promise<GoodsReceipt[]> {
    return getGoodsReceiptRepository().findAll(tenantId);
  }

  async getReceiptById(
    tenantId: string,
    id: string,
  ): Promise<GoodsReceipt | undefined> {
    return getGoodsReceiptRepository().findById(
      tenantId,
      id,
    );
  }

  async getReceiptsByPurchaseOrder(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<GoodsReceipt[]> {
    return getGoodsReceiptRepository().findByPurchaseOrder(
      tenantId,
      purchaseOrderId,
    );
  }

  async createReceipt(
    input: CreateGoodsReceiptInput,
  ): Promise<GoodsReceipt> {
    if (!input.tenantId) {
      throw new Error("Tenant is required.");
    }

    if (!input.storeId) {
      throw new Error("Store is required.");
    }

    if (!input.purchaseOrderId) {
      throw new Error("Purchase order is required.");
    }

    if (!input.supplierId) {
      throw new Error("Supplier is required.");
    }

    if (!input.warehouseId) {
      throw new Error("Warehouse is required.");
    }

    if (!input.items.length) {
      throw new Error("At least one item is required.");
    }

    const order =
      await purchaseOrderRepository.findById(
        input.tenantId,
        input.purchaseOrderId,
      );

    if (!order) {
      throw new Error("Purchase order not found.");
    }

    if (
      order.status !== "APPROVED" &&
      order.status !== "PARTIALLY_RECEIVED"
    ) {
      throw new Error(
        "Only approved or partially received purchase orders can receive goods.",
      );
    }

    if (order.supplierId !== input.supplierId) {
      throw new Error(
        "Supplier does not match the purchase order.",
      );
    }

    if (
      !order.warehouseId ||
      order.warehouseId !== input.warehouseId
    ) {
      throw new Error(
        "Warehouse does not match the purchase order.",
      );
    }

    const orderItems =
      await purchaseOrderItemRepository.findAll(
        input.tenantId,
        order.id,
      );

    if (!orderItems.length) {
      throw new Error(
        "Purchase order has no items.",
      );
    }

    /*
     * ========================================================
     * PREVALIDATE EVERYTHING BEFORE TOUCHING INVENTORY
     * ========================================================
     */

    const plannedReceived =
      new Map<string, number>();

    const validatedItems = input.items.map(
      (inputItem) => {
        if (inputItem.quantityReceived <= 0) {
          throw new Error(
            "Received quantity must be greater than zero.",
          );
        }

        const orderItem =
          orderItems.find(
            (item) =>
              item.id ===
                inputItem.purchaseOrderItemId &&
              item.productId ===
                inputItem.productId,
          );

        if (!orderItem) {
          throw new Error(
            "Purchase order item not found.",
          );
        }

        const alreadyPlanned =
          plannedReceived.get(orderItem.id) ?? 0;

        const remaining =
          orderItem.quantity -
          orderItem.receivedQuantity -
          alreadyPlanned;

        if (inputItem.quantityReceived > remaining) {
          throw new Error(
            `Cannot receive more than the remaining quantity (${remaining}).`,
          );
        }

        const unitCost =
          inputItem.unitCost ??
          orderItem.unitCost;

        if (unitCost < 0) {
          throw new Error(
            "Unit cost cannot be negative.",
          );
        }

        plannedReceived.set(
          orderItem.id,
          alreadyPlanned +
            inputItem.quantityReceived,
        );

        return {
          inputItem,
          orderItem,
          unitCost,
          quantityReceived:
            inputItem.quantityReceived,
          lineTotal:
            inputItem.quantityReceived *
            unitCost,
        };
      },
    );

    const receiptId =
      input.id ??
      crypto.randomUUID();

    const now =
      new Date().toISOString();

    /*
     * ========================================================
     * APPLY INVENTORY + PO UPDATES
     * ========================================================
     */

    const receiptItems: GoodsReceiptItem[] =
      [];

    for (
      const item of validatedItems
    ) {
      await inventoryTransactionService.receiveStock(
        item.orderItem.productId,
        input.warehouseId,
        item.quantityReceived,
        item.unitCost,
        receiptId,
        `Goods receipt for ${order.orderNumber}`,
      );

      await purchaseOrderItemRepository.update(
        input.tenantId,
        item.orderItem.id,
        {
          receivedQuantity:
            item.orderItem.receivedQuantity +
            item.quantityReceived,
          updatedAt: now,
        },
      );

      receiptItems.push({
        id:
          item.inputItem.id ??
          crypto.randomUUID(),

        goodsReceiptId:
          receiptId,

        purchaseOrderItemId:
          item.orderItem.id,

        productId:
          item.orderItem.productId,

        quantityReceived:
          item.quantityReceived,

        unitCost:
          item.unitCost,

        lineTotal:
          item.lineTotal,
      });
    }

    const updatedItems =
      await purchaseOrderItemRepository.findAll(
        input.tenantId,
        order.id,
      );

    const completed =
      updatedItems.every(
        (item) =>
          item.receivedQuantity >=
          item.quantity,
      );

    await purchaseOrderRepository.update(
      input.tenantId,
      order.id,
      {
        status:
          completed
            ? "RECEIVED"
            : "PARTIALLY_RECEIVED",

        updatedAt: now,
      },
    );

    const receipt: GoodsReceipt = {
      id: receiptId,
      tenantId: input.tenantId,
      storeId: input.storeId,
      purchaseOrderId:
        input.purchaseOrderId,
      supplierId:
        input.supplierId,
      warehouseId:
        input.warehouseId,

      receiptNumber:
        `GR-${Date.now()}`,

      items: receiptItems,

      receivedDate: now,

      receivedBy:
        input.receivedBy,

      notes:
        input.notes,

      createdAt: now,
    };

    return getGoodsReceiptRepository().create(
      receipt,
    );
  }
}

export const goodsReceiptService =
  new GoodsReceiptService();


