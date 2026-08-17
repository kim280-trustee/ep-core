/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Supabase Inventory Transaction Repository
 * ============================================================
 */

import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  InventoryTransaction,
  InventoryTransactionType,
} from "../types/inventory-transaction.types";

const TABLE =
  "inventory_transactions";

interface InventoryTransactionDatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string | null;
  warehouse_id: string;
  product_id: string;
  type: string;
  quantity: number | string;
  before_quantity: number | string;
  after_quantity: number | string;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

function fromDatabaseRow(
  row: InventoryTransactionDatabaseRow,
): InventoryTransaction {
  return {
    id: row.id,

    tenantId:
      row.tenant_id,

    storeId:
      row.store_id ?? undefined,

    warehouseId:
      row.warehouse_id,

    productId:
      row.product_id,

    type:
      row.type as InventoryTransactionType,

    quantity:
      Number(row.quantity),

    beforeQuantity:
      Number(row.before_quantity),

    afterQuantity:
      Number(row.after_quantity),

    referenceId:
      row.reference_id ?? undefined,

    note:
      row.note ?? undefined,

    createdAt:
      row.created_at,
  };
}

class SupabaseInventoryTransactionRepository {

  async findAll(
    tenantId: string,
  ): Promise<InventoryTransaction[]> {
    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .select("*")
      .eq(
        "tenant_id",
        tenantId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      (row) =>
        fromDatabaseRow(
          row as InventoryTransactionDatabaseRow,
        ),
    );
  }

  async findByProduct(
    tenantId: string,
    productId: string,
  ): Promise<InventoryTransaction[]> {
    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .select("*")
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "product_id",
        productId,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      (row) =>
        fromDatabaseRow(
          row as InventoryTransactionDatabaseRow,
        ),
    );
  }

  async create(
    transaction: InventoryTransaction,
  ): Promise<InventoryTransaction> {
    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .insert({
        id:
          transaction.id,

        tenant_id:
          transaction.tenantId,

        store_id:
          transaction.storeId ?? null,

        warehouse_id:
          transaction.warehouseId,

        product_id:
          transaction.productId,

        type:
          transaction.type,

        quantity:
          transaction.quantity,

        before_quantity:
          transaction.beforeQuantity,

        after_quantity:
          transaction.afterQuantity,

        reference_id:
          transaction.referenceId ?? null,

        note:
          transaction.note ?? null,

        created_at:
          transaction.createdAt,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return fromDatabaseRow(
      data as InventoryTransactionDatabaseRow,
    );
  }
}

export const supabaseInventoryTransactionRepository =
  new SupabaseInventoryTransactionRepository();