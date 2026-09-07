import type { SalesOrder } from "@/features/sales/types/sales-order.types";
import type { PurchaseOrder } from "@/features/purchasing/types/purchase-order.types";
import type { InventoryRecord } from "@/features/inventory/types/inventory.types";
import type { InventoryTransaction } from "@/features/inventory-transactions/types/inventory-transaction.types";
import type { Product } from "@/features/products/types/product.types";
import type { Warehouse } from "@/features/warehouses/types/warehouse.types";

export interface DashboardSummary {
  todaySales: number;
  todayProfit: number;
  todayTransactions: number;
  inventoryValue: number;
  lowStockItems: number;
  pendingPurchaseOrders: number;
}

export interface DashboardRecentSale {
  id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
}

export interface DashboardLowStockProduct {
  productId: string;
  productName: string;
  quantityOnHand: number;
  minimumStockLevel: number;
  warehouseName: string;
}

export interface DashboardPendingPurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  currency: string;
  businessName: string;
  recentSales: DashboardRecentSale[];
  lowStockProducts: DashboardLowStockProduct[];
  pendingPurchaseOrders: DashboardPendingPurchaseOrder[];
}

export type {
  SalesOrder,
  PurchaseOrder,
  InventoryRecord,
  InventoryTransaction,
  Product,
  Warehouse,
};
