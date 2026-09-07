/**
 * ============================================================
 * Dashboard Repository
 * ============================================================
 */

import type {
  DashboardRepository,
} from "./dashboard.repository";

import type {
  DashboardSummary,
} from "../types";

import {
  salesOrderRepository,
} from "@/features/sales/repositories";

import {
  purchaseOrderRepository,
} from "@/features/purchasing/repositories";

import {
  customerRepository,
} from "@/features/customers/repositories";

import {
  supplierRepository,
} from "@/features/suppliers/repositories";

import {
  inventoryRepository,
} from "@/features/inventory/repositories";

import {
  expenseService,
} from "@/features/expenses/services/expense.service";

import {
  inventoryTransactionService,
} from "@/features/inventory-transactions/services/inventory-transaction.service";

import {
  storeContext,
} from "@/core/store/store.context";

class InMemoryDashboardRepository
  implements DashboardRepository {

  async getSummary(
    tenantId: string,
  ): Promise<DashboardSummary> {
    const context = storeContext.getStore();
    const storeId = context?.storeId;

    const [
      orders,
      purchaseOrders,
      customers,
      suppliers,
      inventory,
      inventoryTransactions,
      expenses,
    ] = await Promise.all([
      salesOrderRepository.findAll(tenantId),
      purchaseOrderRepository.findAll(tenantId),
      customerRepository.findAll(tenantId),
      supplierRepository.findAll(tenantId),
      inventoryRepository.findAllAsync(tenantId),
      inventoryTransactionService.getTransactions(tenantId),
      storeId
        ? expenseService.getExpenses(tenantId, storeId)
        : Promise.resolve([]),
    ]);

    const completedOrders = orders.filter(
      (order) =>
        order.status === "COMPLETED" &&
        (!storeId || order.storeId === storeId),
    );

    const receivedPurchaseOrders = purchaseOrders.filter(
      (order) =>
        (order.status === "RECEIVED" ||
          order.status === "PARTIALLY_RECEIVED") &&
        (!storeId || order.storeId === storeId),
    );

    const totalSales = completedOrders.reduce(
      (total, order) =>
        total + Number(order.totalAmount ?? 0),
      0,
    );

    const totalPurchases = receivedPurchaseOrders.reduce(
      (total, order) =>
        total +
        order.items.reduce(
          (itemTotal, item) =>
            itemTotal +
            Math.max(0, Number(item.receivedQuantity) || 0) *
            (Number(item.unitCost) || 0),
          0,
        ),
      0,
    );

    const totalCostOfSales = inventoryTransactions
      .filter(
        (transaction) =>
          transaction.movementType === "SALE" &&
          (!storeId || transaction.storeId === storeId),
      )
      .reduce(
        (total, transaction) =>
          total +
          Math.abs(Number(transaction.quantity) || 0) *
          (Number(transaction.unitCost) || 0),
        0,
      );

    const totalExpenses = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount ?? 0),
      0,
    );

    const totalRevenue = totalSales;

    const totalProfit =
      totalRevenue - totalCostOfSales - totalExpenses;

    const inventoryValue = inventory.reduce(
      (total, record) =>
        total +
        Number(record.quantityOnHand ?? 0) *
        Number(record.averageCost ?? 0),
      0,
    );

    const lowStockItems = inventory.filter(
      (record) =>
        Number(record.availableQuantity ?? 0) <=
        Number(record.minimumStockLevel ?? 0),
    ).length;

    return {
      totalSales,
      totalPurchases,
      totalRevenue,
      totalProfit,
      inventoryValue,
      lowStockItems,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
    };
  }
}

export const inMemoryDashboardRepository =
  new InMemoryDashboardRepository();
