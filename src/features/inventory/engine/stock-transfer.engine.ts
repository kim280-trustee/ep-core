import type { InventoryRecord } from "../types/inventory-record.types";
import { inventoryTransactionService } from "@/features/inventory-transactions/services/inventory-transaction.service";
import { inventoryService } from "../services/inventory.service";
import { storeContext } from "@/core/store/store.context";

export class StockTransferEngine {
  async transfer(
    source: InventoryRecord,
    destination: InventoryRecord,
    quantity: number,
    reason?: string,
  ): Promise<{
    source: InventoryRecord;
    destination: InventoryRecord;
  }> {
    if (quantity <= 0) {
      throw new Error(
        "Transfer quantity must be greater than zero.",
      );
    }

    if (source.tenantId !== destination.tenantId) {
      throw new Error(
        "Source and destination must belong to the same tenant.",
      );
    }

    if (source.productId !== destination.productId) {
      throw new Error(
        "Source and destination must contain the same product.",
      );
    }

    if (source.warehouseId === destination.warehouseId) {
      throw new Error(
        "Source and destination warehouses must be different.",
      );
    }

    if (source.availableQuantity < quantity) {
      throw new Error(
        `Insufficient stock for product ${source.productId}.`,
      );
    }

    const context = storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    const sourceBefore = source.quantityOnHand;
    const destinationBefore =
      destination.quantityOnHand;

    const unitCost = source.averageCost;
    const transferReference =
      crypto.randomUUID();

    await inventoryService.decreaseStock(
      source,
      quantity,
    );

    await inventoryService.increaseStock(
      destination,
      quantity,
      unitCost,
    );

    await inventoryTransactionService.createTransaction({
      tenantId: source.tenantId,
      storeId: context.storeId,
      productId: source.productId,
      warehouseId: source.warehouseId,
      movementType: "TRANSFER_OUT",
      quantity,
      unitCost,
      referenceType: "STOCK_TRANSFER",
      referenceId: transferReference,
      notes: reason ?? "Stock transfer",
      beforeQuantity: sourceBefore,
      afterQuantity:
        sourceBefore - quantity,
    });

    await inventoryTransactionService.createTransaction({
      tenantId: destination.tenantId,
      storeId: context.storeId,
      productId: destination.productId,
      warehouseId: destination.warehouseId,
      movementType: "TRANSFER_IN",
      quantity,
      unitCost,
      referenceType: "STOCK_TRANSFER",
      referenceId: transferReference,
      notes: reason ?? "Stock transfer",
      beforeQuantity: destinationBefore,
      afterQuantity:
        destinationBefore + quantity,
    });

    const updatedSource =
      await inventoryService.getInventoryRecord(
        source.tenantId,
        source.productId,
        source.warehouseId,
      );

    const updatedDestination =
      await inventoryService.getInventoryRecord(
        destination.tenantId,
        destination.productId,
        destination.warehouseId,
      );

    if (
      !updatedSource ||
      !updatedDestination
    ) {
      throw new Error(
        "Unable to reload inventory after stock transfer.",
      );
    }

    return {
      source: updatedSource,
      destination: updatedDestination,
    };
  }

  async transferToWarehouse(
    source: InventoryRecord,
    destinationWarehouseId: string,
    quantity: number,
    reason?: string,
  ): Promise<{
    source: InventoryRecord;
    destination: InventoryRecord;
  }> {
    if (quantity <= 0) {
      throw new Error(
        "Transfer quantity must be greater than zero.",
      );
    }

    const context = storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    if (source.tenantId !== context.tenantId) {
      throw new Error(
        "Source inventory does not belong to the current tenant.",
      );
    }

    if (source.warehouseId === destinationWarehouseId) {
      throw new Error(
        "Source and destination warehouses must be different.",
      );
    }

    if (source.availableQuantity < quantity) {
      throw new Error(
        `Insufficient stock for product ${source.productId}.`,
      );
    }

    let destination =
      await inventoryService.getInventoryRecord(
        context.tenantId,
        source.productId,
        destinationWarehouseId,
      );

    if (!destination) {
      destination =
        await inventoryService.createInventoryRecord({
          id: crypto.randomUUID(),
          tenantId: context.tenantId,
          productId: source.productId,
          warehouseId: destinationWarehouseId,
          quantityOnHand: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          averageCost: source.averageCost,
          minimumStockLevel: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    }

    return this.transfer(
      source,
      destination,
      quantity,
      reason,
    );
  }
}

export const stockTransferEngine =
  new StockTransferEngine();
