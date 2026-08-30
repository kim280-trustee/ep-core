import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderRepository,
} from "./purchase-order.repository";


interface PurchaseOrderDatabaseRow {

  id: string;

  tenant_id: string;

  store_id: string | null;

  supplier_id: string;

  warehouse_id: string | null;

  order_number: string;

  order_date: string;

  expected_delivery_date: string | null;

  status: string;

  currency: string;

  subtotal: number | string;

  tax_amount: number | string;

  total_amount: number | string;

  notes: string | null;

  created_by: string | null;

  created_at: string;

  updated_at: string;

}


function fromDatabaseRow(
  row: PurchaseOrderDatabaseRow,
): PurchaseOrder {

  return {

    id:
      row.id,

    tenantId:
      row.tenant_id,

    storeId:
      row.store_id,

    supplierId:
      row.supplier_id,

    warehouseId:
      row.warehouse_id,

    orderNumber:
      row.order_number,

    orderDate:
      row.order_date,

    expectedDeliveryDate:
      row.expected_delivery_date,

    status:
      row.status as PurchaseOrder["status"],

    currency:
      row.currency,

    items:
      [],

    subtotal:
      Number(row.subtotal),

    taxAmount:
      Number(row.tax_amount),

    totalAmount:
      Number(row.total_amount),

    notes:
      row.notes,

    createdBy:
      row.created_by,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

  };

}


class SupabasePurchaseOrderRepository
  implements PurchaseOrderRepository {


  async findAll(
    tenantId: string,
  ): Promise<PurchaseOrder[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_orders")
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
          row as PurchaseOrderDatabaseRow,
        ),
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrder | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_orders")
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
      data as PurchaseOrderDatabaseRow,
    );

  }


  async findBySupplier(
    tenantId: string,
    supplierId: string,
  ): Promise<PurchaseOrder[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_orders")
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "supplier_id",
          supplierId,
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
          row as PurchaseOrderDatabaseRow,
        ),
    );

  }


  async create(
    order: PurchaseOrder,
  ): Promise<PurchaseOrder> {

    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_orders")
        .insert({

          id:
            order.id,

          tenant_id:
            order.tenantId,

          store_id:
            order.storeId,

          supplier_id:
            order.supplierId,

          warehouse_id:
            order.warehouseId,

          order_number:
            order.orderNumber,

          order_date:
            order.orderDate,

          expected_delivery_date:
            order.expectedDeliveryDate,

          status:
            order.status,

          currency:
            order.currency,

          subtotal:
            order.subtotal,

          tax_amount:
            order.taxAmount,

          total_amount:
            order.totalAmount,

          notes:
            order.notes,

          created_by:
            order.createdBy,

          created_at:
            order.createdAt,

          updated_at:
            order.updatedAt,

        })
        .select("*")
        .single();


    if (error) {

      throw error;

    }


    return fromDatabaseRow(
      data as PurchaseOrderDatabaseRow,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder | undefined> {

    const updateData:
      Record<string, unknown> = {};


    if (
      updates.storeId !== undefined
    ) {

      updateData.store_id =
        updates.storeId;

    }


    if (
      updates.supplierId !== undefined
    ) {

      updateData.supplier_id =
        updates.supplierId;

    }


    if (
      updates.warehouseId !== undefined
    ) {

      updateData.warehouse_id =
        updates.warehouseId;

    }


    if (
      updates.orderNumber !== undefined
    ) {

      updateData.order_number =
        updates.orderNumber;

    }


    if (
      updates.orderDate !== undefined
    ) {

      updateData.order_date =
        updates.orderDate;

    }


    if (
      updates.expectedDeliveryDate !== undefined
    ) {

      updateData.expected_delivery_date =
        updates.expectedDeliveryDate;

    }


    if (
      updates.status !== undefined
    ) {

      updateData.status =
        updates.status;

    }


    if (
      updates.currency !== undefined
    ) {

      updateData.currency =
        updates.currency;

    }


    if (
      updates.subtotal !== undefined
    ) {

      updateData.subtotal =
        updates.subtotal;

    }


    if (
      updates.taxAmount !== undefined
    ) {

      updateData.tax_amount =
        updates.taxAmount;

    }


    if (
      updates.totalAmount !== undefined
    ) {

      updateData.total_amount =
        updates.totalAmount;

    }


    if (
      updates.notes !== undefined
    ) {

      updateData.notes =
        updates.notes;

    }


    if (
      updates.createdBy !== undefined
    ) {

      updateData.created_by =
        updates.createdBy;

    }


    updateData.updated_at =
      new Date().toISOString();


    const {
      data,
      error,
    } =
      await supabase
        .from("purchase_orders")
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
      data as PurchaseOrderDatabaseRow,
    );

  }

}


export const supabasePurchaseOrderRepository =
  new SupabasePurchaseOrderRepository();
