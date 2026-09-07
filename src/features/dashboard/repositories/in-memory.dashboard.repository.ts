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
  productRepositoryProvider,
} from "@/features/products/repositories";


class InMemoryDashboardRepository
  implements DashboardRepository {

  async getSummary(
    tenantId: string,
  ): Promise<DashboardSummary> {
    const [
      orders,
      purchaseOrders,
      customers,
      suppliers,
      inventory,
      productsResult,
    ] = await Promise.all([
      salesOrderRepository.findAll(tenantId),
      purchaseOrderRepository.findAll(tenantId),
      customerRepository.findAll(tenantId),
      supplierRepository.findAll(tenantId),
      inventoryRepository.findAllAsync(tenantId),
      productRepositoryProvider.findAll(tenantId, {
        page: 1,
        limit: 10000,
      }),
    ]);

    const productCostById = new Map(
      productsResult.data.map((product) => [
        product.id,
        Number(product.costPrice ?? product.pricing.costPrice ?? 0),
      ]),
    );

    const totalSales = orders.reduce(
      (total, order) =>
        total + Number(order.totalAmount ?? 0),
      0,
    );

    const totalPurchases = purchaseOrders.reduce(
      (total, order) =>
        total + Number(order.totalAmount ?? 0),
      0,
    );

    const totalCostOfSales = orders.reduce(
      (total, order) =>
        total +
        order.items.reduce(
          (itemTotal, item) =>
            itemTotal +
            Number(item.quantity ?? 0) *
            Number(productCostById.get(item.productId) ?? 0),
          0,
        ),
      0,
    );

    const totalRevenue = totalSales;

    const totalProfit =
      totalRevenue - totalCostOfSales;

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
