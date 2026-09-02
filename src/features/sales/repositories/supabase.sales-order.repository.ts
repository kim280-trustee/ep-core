import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  SalesOrder,
} from "../types/sales-order.types";

import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";


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


interface SalesOrderItemDatabaseRow {

  id: string;

  sales_order_id: string;

  product_id: string;

  quantity: number | string;

  unit_price: number | string;

  discount_amount: number | string;

  tax_rate: number | string;

  line_total: number | string;

}


function fromDatabaseItem(
  row: SalesOrderItemDatabaseRow,
): SalesOrderItem {

  return {

    id:
      row.id,

    salesOrderId:
      row.sales_order_id,

    productId:
      row.product_id,

    quantity:
      Number(row.quantity),

    unitPrice:
      Number(row.unit_price),

    discountAmount:
      Number(row.discount_amount),

    taxRate:
      Number(row.tax_rate),

    lineTotal:
      Number(row.line_total),

  };

}


function fromDatabaseRow(
  row: SalesOrderDatabaseRow,
  items: SalesOrderItem[] = [],
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

    items,

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


  private async loadItems(
    tenantId: string,
    orderIds: string[],
  ): Promise<Map<string, SalesOrderItem[]>> {

    const result =
      new Map<string, SalesOrderItem[]>();


    if (orderIds.length === 0) {

      return result;

    }



    const {
      data,
      error,
    } =
      await supabase
        .from("sales_order_items")
        .select("*")
        .in(
          "sales_order_id",
          orderIds,
        )
        .eq(
          "tenant_id",
          tenantId,
        );


    if (error) {

      throw new Error(
        `SALES ITEMS QUERY FAILED: ${error.message}`,
      );

    }


    if (!data || data.length === 0) {

      return result;

    }


    for (const row of data ?? []) {

      const databaseRow =
        row as SalesOrderItemDatabaseRow;


      const item =
        fromDatabaseItem(
          databaseRow,
        );


      const salesOrderId =
        databaseRow.sales_order_id;


      const existing =
        result.get(
          salesOrderId,
        ) ?? [];


      existing.push(item);


      result.set(
        salesOrderId,
        existing,
      );

    }


    return result;

  }


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


    const rows =
      (data ?? []) as SalesOrderDatabaseRow[];


    const itemMap =
      await this.loadItems(
        tenantId,
        rows.map(
          (row) =>
            row.id,
        ),
      );


    return rows.map(
      (row) =>
        fromDatabaseRow(
          row,
          itemMap.get(row.id) ?? [],
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


    const itemMap =
      await this.loadItems(
        tenantId,
        [
          id,
        ],
      );


    return fromDatabaseRow(
      data as SalesOrderDatabaseRow,
      itemMap.get(id) ?? [],
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
      order.items,
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


    /*
     * Persist only items that are not already
     * present in Supabase.
     *
     * The service supplies the complete order
     * item array when adding an item.
     */

    if (
      updates.items !== undefined
    ) {

      const {
        data: existingItems,
        error: existingItemsError,
      } =
        await supabase
          .from("sales_order_items")
          .select("id")
          .eq(
            "sales_order_id",
            id,
          );


      if (existingItemsError) {

        throw existingItemsError;

      }


      const existingIds =
        new Set(
          (existingItems ?? []).map(
            (item) =>
              item.id,
          ),
        );


      const newItems =
        updates.items.filter(
          (item) =>
            !existingIds.has(
              item.id,
            ),
        );


      if (
        newItems.length > 0
      ) {

        const {
          error:
            insertError,
        } =
          await supabase
            .from("sales_order_items")
            .insert(
              newItems.map(
                (item) => ({

                  id:
                    item.id,

                  sales_order_id:
                    id,

                  tenant_id:
                    updates.tenantId ?? tenantId,

                  product_id:
                    item.productId,

                  quantity:
                    item.quantity,

                  unit_price:
                    item.unitPrice,

                  discount_amount:
                    item.discountAmount,

                  tax_rate:
                    item.taxRate,

                  line_total:
                    item.lineTotal,

                }),
              ),
            );


        if (insertError) {

          throw insertError;

        }


        /*
         * Recalculate the order totals from the
         * complete item collection supplied by
         * the service.
         *
         * This keeps the sales order header
         * synchronized with its line items.
         */

        const subtotal =
          updates.items.reduce(
            (
              total,
              item,
            ) =>
              total +
              (
                item.quantity *
                item.unitPrice
              ),
            0,
          );


        const discountAmount =
          updates.items.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.discountAmount,
            0,
          );


        const taxAmount =
          updates.items.reduce(
            (
              total,
              item,
            ) => {

              const lineSubtotal =
                item.quantity *
                item.unitPrice;

              const taxableAmount =
                Math.max(
                  0,
                  lineSubtotal -
                    item.discountAmount,
                );

              return (
                total +
                (
                  taxableAmount *
                  (
                    item.taxRate /
                    100
                  )
                )
              );

            },
            0,
          );


        const totalAmount =
          Math.max(
            0,
            subtotal -
              discountAmount,
          ) +
          taxAmount;


        const {
          error:
            totalsError,
        } =
          await supabase
            .from("sales_orders")
            .update({

              subtotal,

              discount_amount:
                discountAmount,

              tax_amount:
                taxAmount,

              total_amount:
                totalAmount,

              updated_at:
                new Date().toISOString(),

            })
            .eq(
              "tenant_id",
              tenantId,
            )
            .eq(
              "id",
              id,
            );


        if (totalsError) {

          throw totalsError;

        }

      }

    }


    const itemMap =
      await this.loadItems(
        tenantId,
        [
          id,
        ],
      );


    return fromDatabaseRow(
      data as SalesOrderDatabaseRow,
      itemMap.get(id) ?? [],
    );

  }

}


export const supabaseSalesOrderRepository =
  new SupabaseSalesOrderRepository();
















