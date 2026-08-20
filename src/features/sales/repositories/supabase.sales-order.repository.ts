import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  SalesOrder,
} from "../types/sales-order.types";

interface SalesOrderDatabaseRow {

  id: string;

  tenant_id: string;

  store_id: string | null;

  warehouse_id: string;

  customer_id: string | null;

  order_number: string;

  status: string;

  subtotal: number | string;

  discount_amount: number | string;

  tax_amount: number | string;

  total_amount: number | string;

  payment_status: string;

  notes: string | null;

  created_at: string;

  updated_at: string;

}


function fromDatabaseRow(
  row: SalesOrderDatabaseRow,
): SalesOrder {

  return {

    id:
      row.id,

    tenantId:
      row.tenant_id,

    storeId:
      row.store_id ?? "",

    warehouseId:
      row.warehouse_id,

    customerId:
      row.customer_id ?? undefined,

    orderNumber:
      row.order_number,

    status:
      row.status as SalesOrder["status"],

    items: [],

    subtotal:
      Number(row.subtotal),

    discountAmount:
      Number(row.discount_amount),

    taxAmount:
      Number(row.tax_amount),

    totalAmount:
      Number(row.total_amount),

    paymentStatus:
      row.payment_status as SalesOrder["paymentStatus"],

    notes:
      row.notes ?? undefined,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

  };

}


class SupabaseSalesOrderRepository {


  async findAll(
    tenantId: string,
  ): Promise<SalesOrder[]> {

    const {
      data,
      error,
    } =
      await supabase
        .from("sales_orders")
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
          row as SalesOrderDatabaseRow,
        ),
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<SalesOrder | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("sales_orders")
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
      data as SalesOrderDatabaseRow,
    );

  }


  async create(
    order: SalesOrder,
  ): Promise<SalesOrder> {

    const {
      data,
      error,
    } =
      await supabase
        .from("sales_orders")
        .insert({

          id:
            order.id,

          tenant_id:
            order.tenantId,

          store_id:
            order.storeId || null,

          warehouse_id:
            order.warehouseId,

          customer_id:
            order.customerId ?? null,

          order_number:
            order.orderNumber,

          status:
            order.status,

          subtotal:
            order.subtotal,

          discount_amount:
            order.discountAmount,

          tax_amount:
            order.taxAmount,

          total_amount:
            order.totalAmount,

          payment_status:
            order.paymentStatus,

          notes:
            order.notes ?? null,

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
      data as SalesOrderDatabaseRow,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<SalesOrder>,
  ): Promise<SalesOrder | undefined> {

    const updateData:
      Record<string, unknown> = {};


    if (
      updates.storeId !== undefined
    ) {

      updateData.store_id =
        updates.storeId || null;

    }


    if (
      updates.warehouseId !== undefined
    ) {

      updateData.warehouse_id =
        updates.warehouseId;

    }


    if (
      updates.customerId !== undefined
    ) {

      updateData.customer_id =
        updates.customerId ?? null;

    }


    if (
      updates.orderNumber !== undefined
    ) {

      updateData.order_number =
        updates.orderNumber;

    }


    if (
      updates.status !== undefined
    ) {

      updateData.status =
        updates.status;

    }


    if (
      updates.subtotal !== undefined
    ) {

      updateData.subtotal =
        updates.subtotal;

    }


    if (
      updates.discountAmount !== undefined
    ) {

      updateData.discount_amount =
        updates.discountAmount;

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
      updates.paymentStatus !== undefined
    ) {

      updateData.payment_status =
        updates.paymentStatus;

    }


    if (
      updates.notes !== undefined
    ) {

      updateData.notes =
        updates.notes ?? null;

    }


    updateData.updated_at =
      new Date().toISOString();


    const {
      data,
      error,
    } =
      await supabase
        .from("sales_orders")
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
      data as SalesOrderDatabaseRow,
    );

  }

}


export const supabaseSalesOrderRepository =
  new SupabaseSalesOrderRepository();

