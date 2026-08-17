/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Module
 *
 * Inventory Transaction Service
 * ============================================================
 */

import {
  inventoryTransactionContext,
} from "../repositories/inventory-transaction.context";

import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


class InventoryTransactionService {


  async getTransactions(
    tenantId: string,
  ): Promise<InventoryTransaction[]> {

    if (!tenantId) {

      throw new Error(
        "Tenant ID is required.",
      );

    }

    return (
      inventoryTransactionContext.repository
        .findAll(
          tenantId,
        )
    );

  }


  async getTransactionsByProduct(
    tenantId: string,
    productId: string,
  ): Promise<InventoryTransaction[]> {

    if (!tenantId) {

      throw new Error(
        "Tenant ID is required.",
      );

    }

    if (!productId) {

      throw new Error(
        "Product ID is required.",
      );

    }

    return (
      inventoryTransactionContext.repository
        .findByProduct(
          tenantId,
          productId,
        )
    );

  }


  async createTransaction(
    transaction: InventoryTransaction,
  ): Promise<InventoryTransaction> {

    if (!transaction.id) {

      throw new Error(
        "Inventory transaction ID is required.",
      );

    }

    if (!transaction.tenantId) {

      throw new Error(
        "Inventory transaction tenant ID is required.",
      );

    }

    if (!transaction.warehouseId) {

      throw new Error(
        "Inventory transaction warehouse ID is required.",
      );

    }

    if (!transaction.productId) {

      throw new Error(
        "Inventory transaction product ID is required.",
      );

    }

    if (
      !Number.isFinite(
        transaction.quantity,
      )
    ) {

      throw new Error(
        "Inventory transaction quantity must be a valid number.",
      );

    }

    if (
      !Number.isFinite(
        transaction.beforeQuantity,
      )
    ) {

      throw new Error(
        "Inventory transaction before quantity must be a valid number.",
      );

    }

    if (
      !Number.isFinite(
        transaction.afterQuantity,
      )
    ) {

      throw new Error(
        "Inventory transaction after quantity must be a valid number.",
      );

    }

    return (
      inventoryTransactionContext.repository
        .create(
          transaction,
        )
    );

  }


}


export const inventoryTransactionService =
  new InventoryTransactionService();