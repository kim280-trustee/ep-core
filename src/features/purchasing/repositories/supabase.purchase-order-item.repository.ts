import { supabase } from "@/core/infrastructure/supabase/client";


import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


import type {
  PurchaseOrderItemRepository,
} from "./purchase-order-item.repository";


interface PurchaseOrderItemDatabaseRow {

  id: string;

  tenant_id: string;

  purchase_order_id: string;

  product_id: string;

  quantity: number | string;

  received_quantity: number | string;

  unit_cost: number | string;

  tax_rate: number | string;

  tax_amount: number | string;

  line_total: number | string;

  notes: string | null;

  created_at: string;

  updated_at: string;

}


function fromDatabaseRow(
  row: PurchaseOrderItemDatabaseRow,
): PurchaseOrderItem {

  return {

    id:
      row.id,

    tenantId:
      row.tenant_id,

    purchaseOrderId:
      row.purchase_order_id,

    productId:
      row.product_id,

    quantity:
      Number(row.quantity),

    receivedQuantity:
      Number(row.received_quantity),

    unitCost:
      Number(row.unit_cost),

    taxRate:
      Number(row.tax_rate),

    taxAmount:
      Number(row.tax_amount),

    lineTotal:
      Number(row.line_total),

    notes:
      row.notes,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

  };

}


class SupabasePurchaseOrderItemRepository
  implements PurchaseOrderItemRepository {


  async findAll(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseOrderItem[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_order_items")
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "purchase_order_id",
          purchaseOrderId,
        )
        .order(
          "created_at",
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
          row as PurchaseOrderItemDatabaseRow,
        ),
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrderItem | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_order_items")
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

      return undefined;

    }


    return fromDatabaseRow(
      data as PurchaseOrderItemDatabaseRow,
    );

  }


  async create(
    item: PurchaseOrderItem,
  ): Promise<PurchaseOrderItem> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_order_items")
        .insert({

          id:
            item.id,

          tenant_id:
            item.tenantId,

          purchase_order_id:
            item.purchaseOrderId,

          product_id:
            item.productId,

          quantity:
            item.quantity,

          received_quantity:
            item.receivedQuantity,

          unit_cost:
            item.unitCost,

          tax_rate:
            item.taxRate,

          tax_amount:
            item.taxAmount,

          line_total:
            item.lineTotal,

          notes:
            item.notes,

          created_at:
            item.createdAt,

          updated_at:
            item.updatedAt,

        })
        .select("*")
        .single();


    if (error) {

      throw error;

    }


    return fromDatabaseRow(
      data as PurchaseOrderItemDatabaseRow,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrderItem>,
  ): Promise<PurchaseOrderItem | undefined> {

    const updateData:
      Record<string, unknown> = {};


    if (
      updates.productId !== undefined
    ) {

      updateData.product_id =
        updates.productId;

    }


    if (
      updates.quantity !== undefined
    ) {

      updateData.quantity =
        updates.quantity;

    }


    if (
      updates.receivedQuantity !== undefined
    ) {

      updateData.received_quantity =
        updates.receivedQuantity;

    }


    if (
      updates.unitCost !== undefined
    ) {

      updateData.unit_cost =
        updates.unitCost;

    }


    if (
      updates.taxRate !== undefined
    ) {

      updateData.tax_rate =
        updates.taxRate;

    }


    if (
      updates.taxAmount !== undefined
    ) {

      updateData.tax_amount =
        updates.taxAmount;

    }


    if (
      updates.lineTotal !== undefined
    ) {

      updateData.line_total =
        updates.lineTotal;

    }


    if (
      updates.notes !== undefined
    ) {

      updateData.notes =
        updates.notes;

    }


    updateData.updated_at =
      new Date().toISOString();


    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_order_items")
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
        .maybeSingle();


    if (error) {

      throw error;

    }


    if (!data) {

      return undefined;

    }


    return fromDatabaseRow(
      data as PurchaseOrderItemDatabaseRow,
    );

  }


  async delete(
    tenantId: string,
    id: string,
  ): Promise<void> {

    const {
      error,
    } =
      await supabase
        .from("purchase_order_items")
        .delete()
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "id",
          id,
        );


    if (error) {

      throw error;

    }

  }

}


export const supabasePurchaseOrderItemRepository =
  new SupabasePurchaseOrderItemRepository();