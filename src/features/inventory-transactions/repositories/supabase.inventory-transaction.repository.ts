/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Supabase Inventory Transaction Repository
 * ============================================================
 */

import {
  supabase,
} from "@/core/infrastructure/supabase/client";

import type {
  InventoryTransactionRepository,
} from "./inventory-transaction.repository";

import type {
  InventoryTransaction,
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

  movement_type: string;

  quantity: number | string;

  unit_cost: number | string;

  before_quantity: number | string;

  after_quantity: number | string;

  reference_type: string | null;

  reference_id: string | null;

  notes: string | null;

  created_at: string;

}


function fromDatabaseRow(
  row: InventoryTransactionDatabaseRow,
): InventoryTransaction {

  return {

    id:
      row.id,

    tenantId:
      row.tenant_id,

    storeId:
      row.store_id ?? "",

    productId:
      row.product_id,

    warehouseId:
      row.warehouse_id,

    movementType:
      row.movement_type as InventoryTransaction["movementType"],

    quantity:
      Number(row.quantity),

    unitCost:
      Number(row.unit_cost),

    beforeQuantity:
      Number(row.before_quantity),

    afterQuantity:
      Number(row.after_quantity),

    referenceType:
      row.reference_type ??
      undefined,

    referenceId:
      row.reference_id ??
      undefined,

    notes:
      row.notes ??
      undefined,

    createdAt:
      row.created_at,

  };

}


class SupabaseInventoryTransactionRepository
implements InventoryTransactionRepository {


  async findAll(
    tenantId: string,
  ): Promise<InventoryTransaction[]> {

    const {
      data,
      error,
    } =
      await supabase
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


  async findById(
    tenantId: string,
    id: string,
  ): Promise<InventoryTransaction | null> {

    const {
      data,
      error,
    } =
      await supabase
        .from(TABLE)
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();


    if (error) {

      throw error;

    }


    if (!data) {

      return null;

    }


    return fromDatabaseRow(
      data as InventoryTransactionDatabaseRow,
    );

  }


  async findByProduct(
    tenantId: string,
    productId: string,
  ): Promise<InventoryTransaction[]> {

    const {
      data,
      error,
    } =
      await supabase
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


  async findByWarehouse(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryTransaction[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from(TABLE)
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "warehouse_id",
          warehouseId,
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
    } =
      await supabase
        .from(TABLE)
        .insert({

          id:
            transaction.id,

          tenant_id:
            transaction.tenantId,

          store_id:
            transaction.storeId ||
            null,

          warehouse_id:
            transaction.warehouseId,

          product_id:
            transaction.productId,

          type:
            transaction.movementType,

          movement_type:
            transaction.movementType,

          quantity:
            transaction.quantity,

          unit_cost:
            transaction.unitCost,

          before_quantity:
            transaction.beforeQuantity ??
            0,

          after_quantity:
            transaction.afterQuantity ??
            0,

          reference_type:
            transaction.referenceType ??
            null,

          reference_id:
            transaction.referenceId ??
            null,

          notes:
            transaction.notes ??
            null,

          created_at:
            transaction.createdAt,

        })
        .select("*")
        .single();


    if (error) {

      console.error(
        "[InventoryTransactions] Create failed:",
        error,
      );

      throw error;

    }


    return fromDatabaseRow(
      data as InventoryTransactionDatabaseRow,
    );

  }

}


export const supabaseInventoryTransactionRepository =
  new SupabaseInventoryTransactionRepository();
