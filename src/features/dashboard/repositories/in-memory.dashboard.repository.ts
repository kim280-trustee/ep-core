import type {
  DashboardRepository,
} from "./dashboard.repository";

import type {
  DashboardSummary,
} from "../types";

class InMemoryDashboardRepository
implements DashboardRepository {

  getSummary(): DashboardSummary {

    return {

      totalSales: 0,

      totalPurchases: 0,

      totalRevenue: 0,

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