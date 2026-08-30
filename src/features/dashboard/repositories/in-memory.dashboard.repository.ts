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


class InMemoryDashboardRepository
  implements DashboardRepository {

  async getSummary(
    tenantId: string,
  ): Promise<DashboardSummary> {

    const orders =
      await salesOrderRepository.findAll(
        tenantId,
      );

    const totalSales =
      orders.length;

    const totalRevenue =
      orders.reduce(
        (
          total: number,
          order,
        ) =>
          total +
          Number(
            order.totalAmount ?? 0,
          ),
        0,
      );

    return {
      totalSales,
      totalPurchases: 0,
      totalRevenue,
      totalProfit: 0,
      inventoryValue: 0,
      lowStockItems: 0,
      totalCustomers: 0,
      totalSuppliers: 0,
    };
  }
}

export const inMemoryDashboardRepository =
  new InMemoryDashboardRepository();
