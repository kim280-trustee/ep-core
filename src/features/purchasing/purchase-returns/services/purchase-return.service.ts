import { getPurchaseReturnRepository } from "../repositories/repository.provider";
import type { PurchaseReturn, PurchaseReturnItem } from "../types";
import {
  purchaseOrderRepository,
  purchaseOrderItemRepository,
} from "../../repositories";
import { inventoryTransactionService } from "@/features/inventory-transactions/services/inventory-transaction.service";

export interface CreatePurchaseReturnInput {
  tenantId: string;
  storeId: string;
  purchaseOrderId: string;
  supplierId: string;
  warehouseId: string;
  items: Array<{
    purchaseOrderItemId: string;
    productId: string;
    quantity: number;
    unitCost?: number;
    reason?: string | null;
  }>;
  reason?: string | null;
}

class PurchaseReturnService {
  async getReturns(tenantId: string): Promise<PurchaseReturn[]> {
    return getPurchaseReturnRepository().findAll(tenantId);
  }

  async getReturnById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseReturn | undefined> {
    return getPurchaseReturnRepository().findById(tenantId, id);
  }

  async createReturn(
    input: CreatePurchaseReturnInput,
  ): Promise<PurchaseReturn> {
    if (!input.tenantId) throw new Error("Tenant ID is required.");
    if (!input.storeId) throw new Error("Store ID is required.");
    if (!input.purchaseOrderId) {
      throw new Error("Purchase order is required.");
    }
    if (!input.supplierId) throw new Error("Supplier is required.");
    if (!input.warehouseId) throw new Error("Warehouse is required.");
    if (!input.items.length) {
      throw new Error("Purchase return must contain at least one item.");
    }

    const order = await purchaseOrderRepository.findById(
      input.tenantId,
      input.purchaseOrderId,
    );

    if (!order) throw new Error("Purchase order not found.");

    if (
      order.status !== "RECEIVED" &&
      order.status !== "PARTIALLY_RECEIVED"
    ) {
      throw new Error(
        "Goods must be received before they can be returned.",
      );
    }

    if (order.supplierId !== input.supplierId) {
      throw new Error(
        "Supplier does not match the purchase order.",
      );
    }

    if (order.warehouseId !== input.warehouseId) {
      throw new Error(
        "Warehouse does not match the purchase order.",
      );
    }

    const orderItems = await purchaseOrderItemRepository.findAll(
      input.tenantId,
      input.purchaseOrderId,
    );

    if (!orderItems.length) {
      throw new Error("Purchase order has no items.");
    }

    const existingReturns =
      await getPurchaseReturnRepository().findByPurchaseOrder(
        input.tenantId,
        input.purchaseOrderId,
      );

    const returnedByItem = new Map<string, number>();

    for (const existingReturn of existingReturns) {
      if (existingReturn.status === "CANCELLED") continue;

      for (const item of existingReturn.items) {
        returnedByItem.set(
          item.purchaseOrderItemId,
          (returnedByItem.get(item.purchaseOrderItemId) ?? 0) +
            item.quantity,
        );
      }
    }

    /*
     * Validate the complete return before changing inventory.
     */
    const validatedItems = input.items.map((inputItem) => {
      if (inputItem.quantity <= 0) {
        throw new Error(
          "Return quantity must be greater than zero.",
        );
      }

      const orderItem = orderItems.find(
        (item) =>
          item.id === inputItem.purchaseOrderItemId &&
          item.productId === inputItem.productId,
      );

      if (!orderItem) {
        throw new Error("Purchase order item not found.");
      }

      const alreadyReturned =
        returnedByItem.get(orderItem.id) ?? 0;

      const remainingReturnable =
        orderItem.receivedQuantity - alreadyReturned;

      if (inputItem.quantity > remainingReturnable) {
        throw new Error(
          `Cannot return ${inputItem.quantity} units. Only ${remainingReturnable} units are available for return.`,
        );
      }

      const unitCost =
        inputItem.unitCost ?? orderItem.unitCost;

      if (unitCost < 0) {
        throw new Error("Unit cost cannot be negative.");
      }

      returnedByItem.set(
        orderItem.id,
        alreadyReturned + inputItem.quantity,
      );

      return {
        orderItem,
        quantity: inputItem.quantity,
        unitCost,
        reason:
          inputItem.reason ??
          input.reason ??
          null,
      };
    });

    const returnId = crypto.randomUUID();
    const now = new Date().toISOString();

    const returnItems: PurchaseReturnItem[] = [];

    /*
     * Inventory is changed only after all items pass validation.
     */
    for (const item of validatedItems) {
      await inventoryTransactionService.adjustStock(
        item.orderItem.productId,
        input.warehouseId,
        -item.quantity,
        "ADJUSTMENT_OUT",
        returnId,
        `Purchase return for ${order.orderNumber}`,
      );

      returnItems.push({
        id: crypto.randomUUID(),
        purchaseReturnId: returnId,
        purchaseOrderItemId: item.orderItem.id,
        productId: item.orderItem.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        lineTotal: item.quantity * item.unitCost,
        reason: item.reason,
      });
    }

    const totalAmount = returnItems.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );

    const value: PurchaseReturn = {
      id: returnId,
      tenantId: input.tenantId,
      storeId: input.storeId,
      purchaseOrderId: input.purchaseOrderId,
      supplierId: input.supplierId,
      warehouseId: input.warehouseId,
      returnNumber: `PR-${Date.now()}`,
      status: "COMPLETED",
      items: returnItems,
      totalAmount,
      reason: input.reason ?? null,
      createdAt: now,
      updatedAt: now,
    };

    return getPurchaseReturnRepository().create(value);
  }
}

export const purchaseReturnService = new PurchaseReturnService();

