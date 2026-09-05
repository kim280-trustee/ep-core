import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  GoodsReceipt,
  GoodsReceiptItem,
} from "../types/goods-receipt.types";

import type {
  GoodsReceiptRepository,
} from "./goods-receipt.repository";


interface GoodsReceiptDatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string;
  purchase_order_id: string;
  supplier_id: string;
  warehouse_id: string;
  received_date: string;
  received_by: string | null;
  notes: string | null;
  created_at: string;
}


interface GoodsReceiptItemDatabaseRow {
  id: string;
  tenant_id: string;
  goods_receipt_id: string;
  purchase_order_item_id: string;
  product_id: string;
  quantity_received: number | string;
  unit_cost: number | string;
  line_total: number | string;
  created_at: string;
}


function fromItemRow(
  row: GoodsReceiptItemDatabaseRow,
): GoodsReceiptItem {
  return {
    id: row.id,
    goodsReceiptId: row.goods_receipt_id,
    purchaseOrderItemId: row.purchase_order_item_id,
    productId: row.product_id,
    quantityReceived: Number(row.quantity_received),
    unitCost: Number(row.unit_cost),
    lineTotal: Number(row.line_total),
  };
}


function fromReceiptRow(
  row: GoodsReceiptDatabaseRow,
  items: GoodsReceiptItem[] = [],
): GoodsReceipt {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    storeId: row.store_id,
    purchaseOrderId: row.purchase_order_id,
    supplierId: row.supplier_id,
    warehouseId: row.warehouse_id,
    receiptNumber: `GR-${row.id.slice(0, 8).toUpperCase()}`,
    items,
    receivedDate: row.received_date,
    receivedBy: row.received_by ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}


class SupabaseGoodsReceiptRepository
  implements GoodsReceiptRepository {


  private async loadItems(
    tenantId: string,
    receiptIds: string[],
  ): Promise<Map<string, GoodsReceiptItem[]>> {

    const result =
      new Map<string, GoodsReceiptItem[]>();

    if (receiptIds.length === 0) {
      return result;
    }

    const {
      data,
      error,
    } =
      await supabase
        .from("goods_receipt_items")
        .select("*")
        .eq("tenant_id", tenantId)
        .in("goods_receipt_id", receiptIds)
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      const databaseRow =
        row as GoodsReceiptItemDatabaseRow;

      const item =
        fromItemRow(databaseRow);

      const existing =
        result.get(
          databaseRow.goods_receipt_id,
        ) ?? [];

      existing.push(item);

      result.set(
        databaseRow.goods_receipt_id,
        existing,
      );
    }

    return result;
  }


  async findAll(
    tenantId: string,
  ): Promise<GoodsReceipt[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("goods_receipts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw error;
    }

    const rows =
      (data ?? []) as GoodsReceiptDatabaseRow[];

    const itemMap =
      await this.loadItems(
        tenantId,
        rows.map(row => row.id),
      );

    return rows.map(row =>
      fromReceiptRow(
        row,
        itemMap.get(row.id) ?? [],
      ),
    );
  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<GoodsReceipt | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("goods_receipts")
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

    const itemMap =
      await this.loadItems(
        tenantId,
        [id],
      );

    return fromReceiptRow(
      data as GoodsReceiptDatabaseRow,
      itemMap.get(id) ?? [],
    );
  }


  async findByPurchaseOrder(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<GoodsReceipt[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("goods_receipts")
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
      (data ?? []) as GoodsReceiptDatabaseRow[];

    const itemMap =
      await this.loadItems(
        tenantId,
        rows.map(row => row.id),
      );

    return rows.map(row =>
      fromReceiptRow(
        row,
        itemMap.get(row.id) ?? [],
      ),
    );
  }


  async create(
    receipt: GoodsReceipt,
  ): Promise<GoodsReceipt> {

    const {
      data,
      error,
    } =
      await supabase
        .from("goods_receipts")
        .insert({
          id: receipt.id,
          tenant_id: receipt.tenantId,
          store_id: receipt.storeId,
          purchase_order_id:
            receipt.purchaseOrderId,
          supplier_id:
            receipt.supplierId,
          warehouse_id:
            receipt.warehouseId,
          received_date:
            receipt.receivedDate,
          received_by:
            receipt.receivedBy ?? null,
          notes:
            receipt.notes ?? null,
          created_at:
            receipt.createdAt,
        })
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    if (receipt.items.length > 0) {

      const {
        error: itemError,
      } =
        await supabase
          .from("goods_receipt_items")
          .insert(
            receipt.items.map(item => ({
              id: item.id,
              tenant_id:
                receipt.tenantId,
              goods_receipt_id:
                receipt.id,
              purchase_order_item_id:
                item.purchaseOrderItemId,
              product_id:
                item.productId,
              quantity_received:
                item.quantityReceived,
              unit_cost:
                item.unitCost,
              line_total:
                item.lineTotal,
            })),
          );

      if (itemError) {
        throw itemError;
      }
    }

    return fromReceiptRow(
      data as GoodsReceiptDatabaseRow,
      receipt.items,
    );
  }


  async update(
    tenantId: string,
    id: string,
    receipt: GoodsReceipt,
  ): Promise<GoodsReceipt> {

    const {
      data,
      error,
    } =
      await supabase
        .from("goods_receipts")
        .update({
          store_id:
            receipt.storeId,
          purchase_order_id:
            receipt.purchaseOrderId,
          supplier_id:
            receipt.supplierId,
          warehouse_id:
            receipt.warehouseId,
          received_date:
            receipt.receivedDate,
          received_by:
            receipt.receivedBy ?? null,
          notes:
            receipt.notes ?? null,
        })
        .eq("tenant_id", tenantId)
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Goods receipt not found.");
    }

    return fromReceiptRow(
      data as GoodsReceiptDatabaseRow,
      receipt.items,
    );
  }


  async delete(
    tenantId: string,
    id: string,
  ): Promise<void> {

    const {
      error: itemError,
    } =
      await supabase
        .from("goods_receipt_items")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("goods_receipt_id", id);

    if (itemError) {
      throw itemError;
    }

    const {
      error,
    } =
      await supabase
        .from("goods_receipts")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("id", id);

    if (error) {
      throw error;
    }
  }
}


export const supabaseGoodsReceiptRepository =
  new SupabaseGoodsReceiptRepository();
