/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Supabase Inventory Repository
 * ============================================================
 */

import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";

import type {
  IInventoryRepository,
} from "./inventory.repository";

const TABLE = "inventory";

interface InventoryDatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string;
  warehouse_id: string;
  product_id: string;
  quantity_on_hand: number | string;
  quantity_reserved: number | string;
  average_cost: number | string;
  last_movement_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromDatabaseRow(
  row: InventoryDatabaseRow,
): InventoryRecord {

  const quantityOnHand =
    Number(row.quantity_on_hand);

  const reservedQuantity =
    Number(row.quantity_reserved);

  return {
    id:
      row.id,

    tenantId:
      row.tenant_id,

    productId:
      row.product_id,

    warehouseId:
      row.warehouse_id,

    quantityOnHand,

    reservedQuantity,

    availableQuantity:
      quantityOnHand -
      reservedQuantity,

    averageCost:
      Number(row.average_cost),

    minimumStockLevel:
      0,

    maximumStockLevel:
      undefined,

    lastMovementAt:
      row.last_movement_at ??
      undefined,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

function toDatabaseRow(
  record: InventoryRecord,
): Record<string, unknown> {

  return {
    id:
      record.id,

    tenant_id:
      record.tenantId,

    /*
     * Until a dedicated warehouse/store mapping is introduced,
     * the active warehouse location is represented by the
     * warehouseId supplied by the inventory record.
     */
    store_id:
      record.warehouseId,

    product_id:
      record.productId,

    warehouse_id:
      record.warehouseId,

    quantity_on_hand:
      record.quantityOnHand,

    quantity_reserved:
      record.reservedQuantity,

    average_cost:
      record.averageCost,

    last_movement_at:
      record.lastMovementAt ??
      null,

    created_at:
      record.createdAt,

    updated_at:
      record.updatedAt,
  };
}

class SupabaseInventoryRepository
  implements IInventoryRepository {

  findAll(): InventoryRecord[] {
    throw new Error(
      "findAll() must be accessed through the async Supabase inventory service.",
    );
  }

  findById(
    _id: string,
  ): InventoryRecord | undefined {
    throw new Error(
      "findById() must be accessed through the async Supabase inventory service.",
    );
  }

  findByProduct(
    _productId: string,
  ): InventoryRecord[] {
    throw new Error(
      "findByProduct() must be accessed through the async Supabase inventory service.",
    );
  }

  findByWarehouse(
    _warehouseId: string,
  ): InventoryRecord[] {
    throw new Error(
      "findByWarehouse() must be accessed through the async Supabase inventory service.",
    );
  }

  findByProductAndWarehouse(
    _productId: string,
    _warehouseId: string,
  ): InventoryRecord | undefined {
    throw new Error(
      "Synchronous inventory repository access is no longer supported.",
    );
  }

  create(
    _record: InventoryRecord,
  ): InventoryRecord {
    throw new Error(
      "Synchronous inventory repository access is no longer supported.",
    );
  }

  update(
    _id: string,
    _updates: Partial<InventoryRecord>,
  ): InventoryRecord | undefined {
    throw new Error(
      "Synchronous inventory repository access is no longer supported.",
    );
  }

  delete(
    _id: string,
  ): boolean {
    throw new Error(
      "Inventory records should not be synchronously deleted.",
    );
  }

  async findAllAsync(
    tenantId: string,
  ): Promise<InventoryRecord[]> {

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
        "product_id",
        {
          ascending: true,
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
          row as InventoryDatabaseRow,
        ),
    );
  }

  async findByIdAsync(
    tenantId: string,
    id: string,
  ): Promise<InventoryRecord | null> {

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
        "id",
        id,
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? fromDatabaseRow(
          data as InventoryDatabaseRow,
        )
      : null;
  }

  async findByProductAsync(
    tenantId: string,
    productId: string,
  ): Promise<InventoryRecord[]> {

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
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      (row) =>
        fromDatabaseRow(
          row as InventoryDatabaseRow,
        ),
    );
  }

  async findByWarehouseAsync(
    tenantId: string,
    warehouseId: string,
  ): Promise<InventoryRecord[]> {

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
        "warehouse_id",
        warehouseId,
      );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      (row) =>
        fromDatabaseRow(
          row as InventoryDatabaseRow,
        ),
    );
  }

  async findByProductAndWarehouseAsync(
    tenantId: string,
    productId: string,
    warehouseId: string,
  ): Promise<InventoryRecord | null> {

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
      .eq(
        "warehouse_id",
        warehouseId,
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? fromDatabaseRow(
          data as InventoryDatabaseRow,
        )
      : null;
  }

  async createAsync(
    record: InventoryRecord,
  ): Promise<InventoryRecord> {

    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .insert(
        toDatabaseRow(record),
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return fromDatabaseRow(
      data as InventoryDatabaseRow,
    );
  }

  async updateAsync(
    tenantId: string,
    id: string,
    updates: Partial<InventoryRecord>,
  ): Promise<InventoryRecord> {

    const updateData:
      Record<string, unknown> = {};

    if (
      updates.quantityOnHand !==
      undefined
    ) {
      updateData.quantity_on_hand =
        updates.quantityOnHand;
    }

    if (
      updates.reservedQuantity !==
      undefined
    ) {
      updateData.quantity_reserved =
        updates.reservedQuantity;
    }

    if (
      updates.averageCost !==
      undefined
    ) {
      updateData.average_cost =
        updates.averageCost;
    }

    if (
      updates.lastMovementAt !==
      undefined
    ) {
      updateData.last_movement_at =
        updates.lastMovementAt ??
        null;
    }

    updateData.updated_at =
      new Date().toISOString();

    const {
      data,
      error,
    } = await supabase
      .from(TABLE)
      .update(updateData)
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "id",
        id,
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return fromDatabaseRow(
      data as InventoryDatabaseRow,
    );
  }
}

export const supabaseInventoryRepository =
  new SupabaseInventoryRepository();
