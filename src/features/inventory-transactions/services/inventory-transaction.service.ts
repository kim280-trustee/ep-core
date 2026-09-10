/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Transaction Service
 * ============================================================
 */

import {
  inventoryService,
} from "@/features/inventory/services/inventory.service";

import {
  storeContext,
} from "@/core/store/store.context";

import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";

import type {
  MovementType,
} from "../types/movement-type.types";

import {
  inventoryTransactionRepository,
} from "../repositories";

function createInventoryTransactionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.random() * 16 | 0;
      const value =
        character === "x"
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    },
  );
}
export interface CreateInventoryTransactionInput {

  tenantId: string;

  storeId: string;

  productId: string;

  warehouseId: string;

  movementType: MovementType;

  quantity: number;

  unitCost: number;

  referenceType?: string;

  referenceId?: string;

  notes?: string;

  beforeQuantity?: number;

  afterQuantity?: number;
}

class InventoryTransactionService {

  private getContext() {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    return context;
  }

  async getTransactions(
    tenantId?: string,
  ): Promise<InventoryTransaction[]> {

    const context =
      this.getContext();

    const resolvedTenantId =
      tenantId ??
      context.tenantId;

    return inventoryTransactionRepository.findAll(
      resolvedTenantId,
    );
  }

  async getTransaction(
    id: string,
    tenantId?: string,
  ): Promise<InventoryTransaction | null> {

    const context =
      this.getContext();

    const resolvedTenantId =
      tenantId ??
      context.tenantId;

    return inventoryTransactionRepository.findById(
      resolvedTenantId,
      id,
    );
  }

  async getProductTransactions(
    productId: string,
    tenantId?: string,
  ): Promise<InventoryTransaction[]> {

    const context =
      this.getContext();

    const resolvedTenantId =
      tenantId ??
      context.tenantId;

    return inventoryTransactionRepository.findByProduct(
      resolvedTenantId,
      productId,
    );
  }

  async createTransaction(
    input: CreateInventoryTransactionInput,
  ): Promise<InventoryTransaction> {

    if (!input.tenantId) {
      throw new Error(
        "Tenant ID is required.",
      );
    }

    if (!input.storeId) {
      throw new Error(
        "Store ID is required.",
      );
    }

    if (!input.productId) {
      throw new Error(
        "Product ID is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse ID is required.",
      );
    }

    if (input.quantity === 0) {
      throw new Error(
        "Transaction quantity cannot be zero.",
      );
    }

    if (input.unitCost < 0) {
      throw new Error(
        "Unit cost cannot be negative.",
      );
    }

    const transaction: InventoryTransaction = {
      id: createInventoryTransactionId(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      productId: input.productId,
      warehouseId: input.warehouseId,
      movementType: input.movementType,
      quantity: Math.abs(input.quantity),
      unitCost: input.unitCost,
      beforeQuantity: input.beforeQuantity ?? 0,
      afterQuantity: input.afterQuantity ?? 0,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    return inventoryTransactionRepository.create(
      transaction,
    );
  }

  async receiveStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    incomingCost: number,
    referenceId?: string,
    note?: string,
  ): Promise<InventoryTransaction> {

    const context =
      this.getContext();

    if (quantity <= 0) {
      throw new Error(
        "Received quantity must be greater than zero.",
      );
    }

    if (incomingCost < 0) {
      throw new Error(
        "Incoming cost cannot be negative.",
      );
    }

    let record =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        productId,
        warehouseId,
      );

    const beforeQuantity =
      record?.quantityOnHand ??
      0;

    if (!record) {

      record =
        await inventoryService.createInventoryRecord({
          id: createInventoryTransactionId(),
          tenantId: context.tenantId,
          productId,
          warehouseId,
          quantityOnHand: quantity,
          reservedQuantity: 0,
          availableQuantity: quantity,
          averageCost: incomingCost,
          minimumStockLevel: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

    } else {

      record =
        await inventoryService.increaseStock(
          record,
          quantity,
          incomingCost,
        );
    }

    const afterQuantity =
      record.quantityOnHand;

    return this.createTransaction({
      tenantId: context.tenantId,
      storeId: context.storeId,
      productId,
      warehouseId,
      movementType: "PURCHASE_RECEIPT",
      quantity,
      unitCost: incomingCost,
      referenceType: "PURCHASE_RECEIPT",
      referenceId,
      notes: note ?? "Stock received",
      beforeQuantity,
      afterQuantity,
    });
  }

  async sellStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    referenceId?: string,
    note?: string,
  ): Promise<InventoryTransaction> {

    const context =
      this.getContext();

    if (quantity <= 0) {
      throw new Error(
        "Sale quantity must be greater than zero.",
      );
    }

    const record =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        productId,
        warehouseId,
      );

    if (!record) {
      throw new Error(
        `Inventory record not found for product ${productId}.`,
      );
    }

    if (record.availableQuantity < quantity) {
      throw new Error(
        `Insufficient stock for product ${productId}.`,
      );
    }

    const beforeQuantity =
      record.quantityOnHand;

    const unitCost =
      record.averageCost;

    await inventoryService.decreaseStock(
      record,
      quantity,
    );

    const updatedRecord =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        productId,
        warehouseId,
      );

    const afterQuantity =
      updatedRecord?.quantityOnHand ??
      Math.max(
        0,
        beforeQuantity - quantity,
      );

    return this.createTransaction({
      tenantId: context.tenantId,
      storeId: context.storeId,
      productId,
      warehouseId,
      movementType: "SALE",
      quantity,
      unitCost,
      referenceType: "SALE",
      referenceId,
      notes: note ?? "Stock sold",
      beforeQuantity,
      afterQuantity,
    });
  }

  async returnStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    referenceId?: string,
    note?: string,
  ): Promise<InventoryTransaction> {

    const context =
      this.getContext();

    if (quantity <= 0) {
      throw new Error(
        "Returned quantity must be greater than zero.",
      );
    }

    const record =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        productId,
        warehouseId,
      );

    if (!record) {
      throw new Error(
        `Inventory record not found for product ${productId}.`,
      );
    }

    const beforeQuantity =
      record.quantityOnHand;

    const unitCost =
      record.averageCost;

    const updatedRecord =
      await inventoryService.increaseStock(
        record,
        quantity,
        unitCost,
      );

    const afterQuantity =
      updatedRecord.quantityOnHand;

    return this.createTransaction({
      tenantId: context.tenantId,
      storeId: context.storeId,
      productId,
      warehouseId,

      // SALE_RETURN is the inventory movement.
      // The repository maps this to the database type
      // separately as RETURN.
      movementType: "SALE_RETURN",

      quantity,
      unitCost,
      referenceType: "SALE_RETURN",
      referenceId,
      notes: note ?? "Stock returned from refunded sale",
      beforeQuantity,
      afterQuantity,
    });
  }

  async adjustStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    movementType:
      MovementType =
        "ADJUSTMENT_IN",
    referenceId?: string,
    note?: string,
  ): Promise<InventoryTransaction> {

    const context =
      this.getContext();

    if (quantity === 0) {
      throw new Error(
        "Adjustment quantity cannot be zero.",
      );
    }

    const record =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        productId,
        warehouseId,
      );

    if (!record) {
      throw new Error(
        `Inventory record not found for product ${productId}.`,
      );
    }

    const beforeQuantity =
      record.quantityOnHand;

    const unitCost =
      record.averageCost;

    if (quantity > 0) {

      await inventoryService.increaseStock(
        record,
        quantity,
        unitCost,
      );

    } else {

      const decreaseQuantity =
        Math.abs(quantity);

      if (
        record.availableQuantity <
        decreaseQuantity
      ) {
        throw new Error(
          `Insufficient stock for product ${productId}.`,
        );
      }

      await inventoryService.decreaseStock(
        record,
        decreaseQuantity,
      );
    }

    const updatedRecord =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        productId,
        warehouseId,
      );

    const afterQuantity =
      updatedRecord?.quantityOnHand ??
      Math.max(
        0,
        beforeQuantity + quantity,
      );

    const resolvedMovementType =
      quantity > 0
        ? movementType === "ADJUSTMENT_OUT"
          ? "ADJUSTMENT_IN"
          : movementType
        : movementType === "ADJUSTMENT_IN"
          ? "ADJUSTMENT_OUT"
          : movementType;

    return this.createTransaction({
      tenantId: context.tenantId,
      storeId: context.storeId,
      productId,
      warehouseId,
      movementType: resolvedMovementType,
      quantity,
      unitCost,
      referenceType: "ADJUSTMENT",
      referenceId,
      notes: note ?? "Inventory adjustment",
      beforeQuantity,
      afterQuantity,
    });
  }

  async deleteTransaction(
    _id: string,
  ): Promise<void> {

    throw new Error(
      "Inventory transactions are immutable and cannot be deleted.",
    );
  }
}

export const inventoryTransactionService =
  new InventoryTransactionService();








