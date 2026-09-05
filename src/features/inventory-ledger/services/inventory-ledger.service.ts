import {
  inventoryTransactionService,
} from "../../inventory-transactions/services/inventory-transaction.service";

import {
  productService,
} from "../../products";

import {
  warehouseService,
} from "../../warehouses";

import {
  storeContext,
} from "@/core/store/store.context";

import type {
  InventoryLedgerEntry,
} from "../types/inventory-ledger.types";


class InventoryLedgerService {

  async getLedger(): Promise<InventoryLedgerEntry[]> {

    const context =
      storeContext.getStore();

    if (!context?.tenantId) {
      return [];
    }

    const transactions =
      await inventoryTransactionService.getTransactions(
        context.tenantId,
      );

    const productIds = [
      ...new Set(
        transactions.map(
          (transaction) =>
            transaction.productId,
        ),
      ),
    ];

    const warehouseIds = [
      ...new Set(
        transactions.map(
          (transaction) =>
            transaction.warehouseId,
        ),
      ),
    ];

    const products =
      await Promise.all(
        productIds.map(
          async (productId) => {
            const product =
              await productService.getProduct(
                context.tenantId,
                productId,
              );

            return [
              productId,
              product,
            ] as const;
          },
        ),
      );

    const warehouses =
      await Promise.all(
        warehouseIds.map(
          async (warehouseId) => {
            const warehouse =
              await warehouseService.getWarehouseById(
                warehouseId,
              );

            return [
              warehouseId,
              warehouse,
            ] as const;
          },
        ),
      );

    const productMap =
      new Map(
        products,
      );

    const warehouseMap =
      new Map(
        warehouses,
      );

    return transactions.map(
      (transaction) => {

        const product =
          productMap.get(
            transaction.productId,
          );

        const warehouse =
          warehouseMap.get(
            transaction.warehouseId,
          );

        return {

          id:
            transaction.id,

          productId:
            transaction.productId,

          productName:
            product?.name,

          warehouseId:
            transaction.warehouseId,

          warehouseName:
            warehouse?.name,

          movementType:
            transaction.movementType,

          quantity:
            transaction.quantity,

          unitCost:
            transaction.unitCost,

          referenceType:
            transaction.referenceType,

          referenceId:
            transaction.referenceId,

          createdAt:
            transaction.createdAt,

        };

      },
    );

  }


  async getProductLedger(
    productId: string,
  ): Promise<InventoryLedgerEntry[]> {

    const ledger =
      await this.getLedger();

    return ledger.filter(
      (entry) =>
        entry.productId ===
        productId,
    );

  }


  async getWarehouseLedger(
    warehouseId: string,
  ): Promise<InventoryLedgerEntry[]> {

    const ledger =
      await this.getLedger();

    return ledger.filter(
      (entry) =>
        entry.warehouseId ===
        warehouseId,
    );

  }

}


export const inventoryLedgerService =
  new InventoryLedgerService();
