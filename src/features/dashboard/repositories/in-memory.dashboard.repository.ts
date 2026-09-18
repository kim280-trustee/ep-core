/**
 * ============================================================
 * Dashboard Repository
 * ============================================================
 */

import { supabase } from "@/core/infrastructure/supabase/client";
import type { DashboardRepository } from "./dashboard.repository";
import type {
  DashboardData,
  DashboardLowStockProduct,
  DashboardPendingPurchaseOrder,
  DashboardRecentSale,
} from "../types";

import { settingsService } from "@/features/settings/services/settings.service";

interface WarehouseRow {
  id: string;
  name: string;
}

interface InventoryRow {
  product_id: string;
  warehouse_id: string;
  quantity_on_hand: number | string | null;
  quantity_reserved: number | string | null;
  average_cost: number | string | null;
  minimum_stock_level: number | string | null;
}

interface SaleRow {
  id: string;
  order_number: string;
  total_amount: number | string | null;
  created_at: string;
}

interface PurchaseOrderRow {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | string | null;
  currency: string | null;
  created_at: string;
}

interface InventoryTransactionRow {
  reference_id: string | null;
  quantity: number | string | null;
  unit_cost: number | string | null;
}

interface ProductRow {
  id: string;
  name: string;
}

function startOfTodayIso(): string {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
}

class InMemoryDashboardRepository implements DashboardRepository {
  async getDashboardData(
    tenantId: string,
    storeId: string,
  ): Promise<DashboardData> {
    /*
     * Dashboard-specific reads intentionally do not call the general
     * repository findAll() methods. Those methods correctly return complete
     * datasets for their feature pages, but the dashboard only needs a small
     * slice of each dataset.
     *
     * This keeps the existing repository architecture/frozen feature flows
     * unchanged while avoiding:
     *   - every historical sales order + every sales line item
     *   - every historical inventory transaction
     *   - every historical purchase order
     *   - every product record
     */

    const todayStart = startOfTodayIso();

    const [
      warehouseResult,
      todaySalesResult,
      recentSalesResult,
      pendingPurchaseOrdersResult,
    ] = await Promise.all([
      supabase
        .from("warehouses")
        .select("id,name")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .eq("is_active", true),

      supabase
        .from("sales_orders")
        .select("id,order_number,total_amount,created_at")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .eq("status", "COMPLETED")
        .gte("created_at", todayStart)
        .order("created_at", { ascending: false }),

      supabase
        .from("sales_orders")
        .select("id,order_number,total_amount,created_at")
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("purchase_orders")
        .select(
          "id,order_number,status,total_amount,currency,created_at",
        )
        .eq("tenant_id", tenantId)
        .eq("store_id", storeId)
        .in("status", [
          "APPROVED",
          "PARTIALLY_RECEIVED",
        ])
        .order("created_at", { ascending: false }),
    ]);

    if (warehouseResult.error) {
      throw warehouseResult.error;
    }

    if (todaySalesResult.error) {
      throw todaySalesResult.error;
    }

    if (recentSalesResult.error) {
      throw recentSalesResult.error;
    }

    if (pendingPurchaseOrdersResult.error) {
      throw pendingPurchaseOrdersResult.error;
    }

    const warehouses =
      (warehouseResult.data ?? []) as WarehouseRow[];

    const storeWarehouseIds =
      warehouses.map((warehouse) => warehouse.id);

    const todaySales =
      (todaySalesResult.data ?? []) as SaleRow[];

    const recentSalesRows =
      (recentSalesResult.data ?? []) as SaleRow[];

    const pendingPurchaseOrderRows =
      (pendingPurchaseOrdersResult.data ?? []) as PurchaseOrderRow[];

    const inventoryResult =
      storeWarehouseIds.length === 0
        ? { data: [], error: null }
        : await supabase
            .from("inventory")
            .select(
              "product_id,warehouse_id,quantity_on_hand,quantity_reserved,average_cost,minimum_stock_level",
            )
            .eq("tenant_id", tenantId)
            .in("warehouse_id", storeWarehouseIds);

    if (inventoryResult.error) {
      throw inventoryResult.error;
    }

    const inventory =
      (inventoryResult.data ?? []) as InventoryRow[];

    const lowStockRecords = inventory.filter(
      (record) => {
        const quantityOnHand =
          Number(record.quantity_on_hand ?? 0);

        const quantityReserved =
          Number(record.quantity_reserved ?? 0);

        const availableQuantity =
          quantityOnHand - quantityReserved;

        return (
          availableQuantity <=
          Number(record.minimum_stock_level ?? 0)
        );
      },
    );

    const lowStockItems =
      lowStockRecords.length;

    const lowStockProductIds = [
      ...new Set(
        lowStockRecords
          .slice(0, 10)
          .map((record) => record.product_id),
      ),
    ];

    const productResult =
      lowStockProductIds.length === 0
        ? { data: [], error: null }
        : await supabase
            .from("products")
            .select("id,name")
            .eq("tenant_id", tenantId)
            .in("id", lowStockProductIds);

    if (productResult.error) {
      throw productResult.error;
    }

    const products =
      (productResult.data ?? []) as ProductRow[];

    const productMap = new Map<string, string>();

    for (const product of products) {
      productMap.set(product.id, product.name);
    }

    const warehouseMap = new Map<string, string>();

    for (const warehouse of warehouses) {
      warehouseMap.set(warehouse.id, warehouse.name);
    }

    const todaySaleIds =
      todaySales.map((sale) => sale.id);

    const inventoryTransactionResult =
      todaySaleIds.length === 0
        ? { data: [], error: null }
        : await supabase
            .from("inventory_transactions")
            .select("reference_id,quantity,unit_cost")
            .eq("tenant_id", tenantId)
            .eq("store_id", storeId)
            .eq("movement_type", "SALE")
            .eq("reference_type", "SALE")
            .in("reference_id", todaySaleIds);

    if (inventoryTransactionResult.error) {
      throw inventoryTransactionResult.error;
    }

    const todaySaleTransactions =
      (inventoryTransactionResult.data ?? []) as InventoryTransactionRow[];

    const todaySalesTotal =
      todaySales.reduce(
        (total, sale) =>
          total +
          Number(sale.total_amount ?? 0),
        0,
      );

    const todayCostOfSales =
      todaySaleTransactions.reduce(
        (total, transaction) =>
          total +
          Math.abs(
            Number(transaction.quantity) || 0,
          ) *
            (Number(transaction.unit_cost) || 0),
        0,
      );

    const inventoryValue =
      inventory.reduce(
        (total, record) =>
          total +
          Number(record.quantity_on_hand ?? 0) *
            Number(record.average_cost ?? 0),
        0,
      );

    const recentSales: DashboardRecentSale[] =
      recentSalesRows.map((sale) => ({
        id: sale.id,
        orderNumber: sale.order_number,
        totalAmount: Number(
          sale.total_amount ?? 0,
        ),
        createdAt: sale.created_at,
      }));

    const lowStockProducts: DashboardLowStockProduct[] =
      lowStockRecords
        .slice(0, 10)
        .map((record) => ({
          productId: record.product_id,
          productName:
            productMap.get(record.product_id) ??
            "Unknown Product",
          quantityOnHand: Number(
            record.quantity_on_hand ?? 0,
          ),
          minimumStockLevel: Number(
            record.minimum_stock_level ?? 0,
          ),
          warehouseName:
            warehouseMap.get(record.warehouse_id) ??
            "Unknown Warehouse",
        }));

    const pendingPurchaseOrders: DashboardPendingPurchaseOrder[] =
      pendingPurchaseOrderRows
        .slice(0, 10)
        .map((order) => ({
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: Number(
            order.total_amount ?? 0,
          ),
          currency: order.currency ?? "THB",
        }));

    const settings =
      settingsService.getSettings(tenantId);

    const currency =
      settings?.currency ??
      pendingPurchaseOrders[0]?.currency ??
      "THB";

    const businessName =
      settings?.businessName ??
      "Smart POS";

    return {
      summary: {
        todaySales: todaySalesTotal,
        todayProfit:
          todaySalesTotal - todayCostOfSales,
        todayTransactions:
          todaySales.length,
        inventoryValue,
        lowStockItems,
        pendingPurchaseOrders:
          pendingPurchaseOrderRows.length,
      },
      currency,
      businessName,
      recentSales,
      lowStockProducts,
      pendingPurchaseOrders,
    };
  }
}

export const inMemoryDashboardRepository =
  new InMemoryDashboardRepository();
