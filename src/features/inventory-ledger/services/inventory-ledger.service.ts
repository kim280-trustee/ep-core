import {
  inventoryTransactionService,
} from "../../inventory-transactions/services/inventory-transaction.service";

import type {
  InventoryLedgerEntry,
} from "../types/inventory-ledger.types";


class InventoryLedgerService {


  async getLedger(): Promise<InventoryLedgerEntry[]> {

    const transactions =
      await inventoryTransactionService.getTransactions();

    return transactions.map(
      (transaction) => ({

        id:
          transaction.id,

        productId:
          transaction.productId,

        warehouseId:
          transaction.warehouseId,

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

      }),
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
