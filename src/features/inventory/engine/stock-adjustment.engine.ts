import type { InventoryRecord } from "../types/inventory-record.types";
import { inventoryTransactionService } from "@/features/inventory-transactions/services/inventory-transaction.service";
import { inventoryService } from "../services/inventory.service";

export class StockAdjustmentEngine {
  async adjust(
    record: InventoryRecord,
    quantity: number,
    movementType: "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" = "ADJUSTMENT_IN",
    reason?: string,
  ): Promise<InventoryRecord> {
    if (quantity === 0) {
      throw new Error("Adjustment quantity cannot be zero.");
    }

    const signedQuantity =
      movementType === "ADJUSTMENT_OUT"
        ? -Math.abs(quantity)
        : Math.abs(quantity);

    await inventoryTransactionService.adjustStock(
      record.productId,
      record.warehouseId,
      signedQuantity,
      movementType,
      undefined,
      reason ?? "Inventory adjustment",
    );

    const updatedRecord =
      await inventoryService.getInventoryRecord(
        record.tenantId,
        record.productId,
        record.warehouseId,
      );

    if (!updatedRecord) {
      throw new Error(
        `Inventory record not found for product ${record.productId}.`,
      );
    }

    return updatedRecord;
  }
}

export const stockAdjustmentEngine =
  new StockAdjustmentEngine();
