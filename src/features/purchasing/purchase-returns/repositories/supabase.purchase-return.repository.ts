import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  PurchaseReturn,
  PurchaseReturnItem,
} from "../types";

import type {
  PurchaseReturnRepository,
} from "./purchase-return.repository";

interface PurchaseReturnDatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string;
  purchase_order_id: string;
  supplier_id: string;
  warehouse_id: string;
  return_number: string;
  status: "DRAFT" | "COMPLETED" | "CANCELLED";
  total_amount: number | string;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

interface PurchaseReturnItemDatabaseRow {
  id: string;
  tenant_id: string;
  purchase_return_id: string;
  purchase_order_item_id: string;
  product_id: string;
  quantity: number | string;
  unit_cost: number | string;
  line_total: number | string;
  reason: string | null;
  created_at: string;
}

function fromItemRow(
  row: PurchaseReturnItemDatabaseRow,
): PurchaseReturnItem {
  return {
    id: row.id,
    purchaseReturnId: row.purchase_return_id,
    purchaseOrderItemId: row.purchase_order_item_id,
    productId: row.product_id,
    quantity: Number(row.quantity),
    unitCost: Number(row.unit_cost),
    lineTotal: Number(row.line_total),
    reason: row.reason,
  };
}

function fromReturnRow(
  row: PurchaseReturnDatabaseRow,
  items: PurchaseReturnItem[] = [],
): PurchaseReturn {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    storeId: row.store_id,
    purchaseOrderId: row.purchase_order_id,
    supplierId: row.supplier_id,
    warehouseId: row.warehouse_id,
    returnNumber: row.return_number,
    status: row.status,
    items,
    totalAmount: Number(row.total_amount),
    reason: row.reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class SupabasePurchaseReturnRepository
  implements PurchaseReturnRepository {

  private async loadItems(
    tenantId: string,
    returnIds: string[],
  ): Promise<Map<string, PurchaseReturnItem[]>> {
    const result = new Map<string, PurchaseReturnItem[]>();

    if (returnIds.length === 0) {
      return result;
    }

    const { data, error } = await supabase
      .from("purchase_return_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .in("purchase_return_id", returnIds)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      const databaseRow =
        row as PurchaseReturnItemDatabaseRow;

      const item = fromItemRow(databaseRow);

      const existing =
        result.get(databaseRow.purchase_return_id) ?? [];

      existing.push(item);

      result.set(
        databaseRow.purchase_return_id,
        existing,
      );
    }

    return result;
  }

  async findAll(
    tenantId: string,
  ): Promise<PurchaseReturn[]> {
    const { data, error } = await supabase
      .from("purchase_returns")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const rows =
      (data ?? []) as PurchaseReturnDatabaseRow[];

    const itemMap = await this.loadItems(
      tenantId,
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      fromReturnRow(
        row,
        itemMap.get(row.id) ?? [],
      ),
    );
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseReturn | undefined> {
    const { data, error } = await supabase
      .from("purchase_returns")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    const itemMap = await this.loadItems(
      tenantId,
      [id],
    );

    return fromReturnRow(
      data as PurchaseReturnDatabaseRow,
      itemMap.get(id) ?? [],
    );
  }

  async findByPurchaseOrder(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseReturn[]> {
    const { data, error } = await supabase
      .from("purchase_returns")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("purchase_order_id", purchaseOrderId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const rows =
      (data ?? []) as PurchaseReturnDatabaseRow[];

    const itemMap = await this.loadItems(
      tenantId,
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      fromReturnRow(
        row,
        itemMap.get(row.id) ?? [],
      ),
    );
  }

  async create(
    value: PurchaseReturn,
  ): Promise<PurchaseReturn> {
    const { data, error } = await supabase
      .from("purchase_returns")
      .insert({
        id: value.id,
        tenant_id: value.tenantId,
        store_id: value.storeId,
        purchase_order_id: value.purchaseOrderId,
        supplier_id: value.supplierId,
        warehouse_id: value.warehouseId,
        return_number: value.returnNumber,
        status: value.status,
        total_amount: value.totalAmount,
        reason: value.reason,
        created_at: value.createdAt,
        updated_at: value.updatedAt,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (value.items.length > 0) {
      const { error: itemError } = await supabase
        .from("purchase_return_items")
        .insert(
          value.items.map((item) => ({
            id: item.id,
            tenant_id: value.tenantId,
            purchase_return_id: value.id,
            purchase_order_item_id:
              item.purchaseOrderItemId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_cost: item.unitCost,
            line_total: item.lineTotal,
            reason: item.reason,
          })),
        );

      if (itemError) {
        throw itemError;
      }
    }

    return fromReturnRow(
      data as PurchaseReturnDatabaseRow,
      value.items,
    );
  }

  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseReturn>,
  ): Promise<PurchaseReturn | undefined> {
    const databaseUpdates: Record<string, unknown> = {};

    if (updates.storeId !== undefined) {
      databaseUpdates.store_id = updates.storeId;
    }

    if (updates.purchaseOrderId !== undefined) {
      databaseUpdates.purchase_order_id =
        updates.purchaseOrderId;
    }

    if (updates.supplierId !== undefined) {
      databaseUpdates.supplier_id =
        updates.supplierId;
    }

    if (updates.warehouseId !== undefined) {
      databaseUpdates.warehouse_id =
        updates.warehouseId;
    }

    if (updates.returnNumber !== undefined) {
      databaseUpdates.return_number =
        updates.returnNumber;
    }

    if (updates.status !== undefined) {
      databaseUpdates.status = updates.status;
    }

    if (updates.totalAmount !== undefined) {
      databaseUpdates.total_amount =
        updates.totalAmount;
    }

    if (updates.reason !== undefined) {
      databaseUpdates.reason = updates.reason;
    }

    databaseUpdates.updated_at =
      updates.updatedAt ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("purchase_returns")
      .update(databaseUpdates)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    const itemMap = await this.loadItems(
      tenantId,
      [id],
    );

    return fromReturnRow(
      data as PurchaseReturnDatabaseRow,
      itemMap.get(id) ?? [],
    );
  }
}

export const supabasePurchaseReturnRepository =
  new SupabasePurchaseReturnRepository();
