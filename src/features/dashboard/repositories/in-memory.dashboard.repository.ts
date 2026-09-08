/**
 * ============================================================
 * Dashboard Repository
 * ============================================================
 */

import type { DashboardRepository } from "./dashboard.repository";
import type {
  DashboardData,
  DashboardLowStockProduct,
  DashboardPendingPurchaseOrder,
  DashboardRecentSale,
} from "../types";

import { salesOrderService } from "@/features/sales/services/sales-order.service";
import { purchaseOrderService } from "@/features/purchasing/services/purchase-order.service";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import { inventoryTransactionService } from "@/features/inventory-transactions/services/inventory-transaction.service";
import { productService } from "@/features/products/services/product.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { settingsService } from "@/features/settings/services/settings.service";

function localDateKey(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isToday(value: string): boolean {
  return localDateKey(value) === localDateKey(new Date().toISOString());
}

class InMemoryDashboardRepository implements DashboardRepository {
  async getDashboardData(
    tenantId: string,
    storeId: string,
  ): Promise<DashboardData> {
    const [
      orders,
      purchaseOrders,
      inventory,
      inventoryTransactions,
      productsResult,
      warehouses,
    ] = await Promise.all([
      salesOrderService.getOrders(tenantId),
      purchaseOrderService.getOrders(tenantId),
      inventoryService.getInventory(tenantId),
      inventoryTransactionService.getTransactions(tenantId),
      productService.getProducts(tenantId),
      warehouseService.getWarehouses(),
    ]);

    const storeWarehouseIds = new Set(
      warehouses
        .filter(
          (warehouse) =>
            warehouse.tenantId === tenantId &&
            warehouse.storeId === storeId,
        )
        .map((warehouse) => warehouse.id),
    );

    const storeOrders = orders.filter(
      (order) => order.storeId === storeId,
    );

    const storePurchaseOrders = purchaseOrders.filter(
      (order) => order.storeId === storeId,
    );

    const storeInventory = inventory.filter(
      (record) => storeWarehouseIds.has(record.warehouseId),
    );

    const todayCompletedSales = storeOrders.filter(
      (order) =>
        order.status === "COMPLETED" &&
        isToday(order.createdAt),
    );

    const todaySales = todayCompletedSales.reduce(
      (total, order) =>
        total + Number(order.totalAmount ?? 0),
      0,
    );

    const todayTransactions = todayCompletedSales.length;

    const saleTransactions = inventoryTransactions.filter(
      (transaction) =>
        transaction.movementType === "SALE" &&
        transaction.referenceType === "SALE" &&
        storeWarehouseIds.has(transaction.warehouseId) &&
        isToday(transaction.createdAt),
    );

    const todayCostOfSales = saleTransactions.reduce(
      (total, transaction) =>
        total +
        Math.abs(Number(transaction.quantity) || 0) *
          (Number(transaction.unitCost) || 0),
      0,
    );

    const todayProfit = todaySales - todayCostOfSales;

    const inventoryValue = storeInventory.reduce(
      (total, record) =>
        total +
        Number(record.quantityOnHand ?? 0) *
          Number(record.averageCost ?? 0),
      0,
    );

    const lowStockRecords = storeInventory.filter(
      (record) =>
        Number(record.availableQuantity ?? 0) <=
        Number(record.minimumStockLevel ?? 0),
    );

    const lowStockItems = lowStockRecords.length;

    const pendingPurchaseOrders = storePurchaseOrders.filter(
      (order) =>
        order.status === "APPROVED" ||
        order.status === "PARTIALLY_RECEIVED",
    );

    const productMap = new Map<string, ProductLike>();

    for (const product of productsResult.data) {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
      });
    }

    const warehouseMap = new Map<string, string>();

    for (const warehouse of warehouses) {
      warehouseMap.set(warehouse.id, warehouse.name);
    }

    const recentSales: DashboardRecentSale[] =
      storeOrders
        .filter((order) => order.status === "COMPLETED")
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        )
        .slice(0, 10)
        .map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: Number(order.totalAmount ?? 0),
          createdAt: order.createdAt,
        }));

    const lowStockProducts: DashboardLowStockProduct[] =
      lowStockRecords
        .slice(0, 10)
        .map((record) => ({
          productId: record.productId,
          productName:
            productMap.get(record.productId)?.name ??
            "Unknown Product",
          quantityOnHand: Number(record.quantityOnHand ?? 0),
          minimumStockLevel: Number(
            record.minimumStockLevel ?? 0,
          ),
          warehouseName:
            warehouseMap.get(record.warehouseId) ??
            "Unknown Warehouse",
        }));

    const pendingPurchaseOrderData: DashboardPendingPurchaseOrder[] =
      pendingPurchaseOrders
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        )
        .slice(0, 10)
        .map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: Number(order.totalAmount ?? 0),
          currency: order.currency,
        }));

    const settings = settingsService.getSettings(tenantId);

    const currency =
      settings?.currency ??
      pendingPurchaseOrderData[0]?.currency ??
      "THB";

    const businessName =
      settings?.businessName ??
      "Smart POS";

    return {
      summary: {
        todaySales,
        todayProfit,
        todayTransactions,
        inventoryValue,
        lowStockItems,
        pendingPurchaseOrders: pendingPurchaseOrders.length,
      },
      currency,
      businessName,
      recentSales,
      lowStockProducts,
      pendingPurchaseOrders:
        pendingPurchaseOrderData,
    };
  }
}

interface ProductLike {
  id: string;
  name: string;
}

export const inMemoryDashboardRepository =
  new InMemoryDashboardRepository();
