import { create } from "zustand";
import { dashboardService } from "../services";
import { storeContext } from "@/core/store/store.context";
import type { DashboardData } from "../types";

const emptyDashboard: DashboardData = {
  summary: {
    todaySales: 0,
    todayProfit: 0,
    todayTransactions: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    pendingPurchaseOrders: 0,
  },
  currency: "THB",
  businessName: "Smart POS",
  recentSales: [],
  lowStockProducts: [],
  pendingPurchaseOrders: [],
};

interface DashboardStore {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
}

export const useDashboardStore =
  create<DashboardStore>((set) => ({
    data: emptyDashboard,
    loading: false,
    error: null,

    loadDashboard: async () => {
      const context =
        storeContext.getStore();

      if (!context?.tenantId) {
        set({
          error:
            "Tenant context is not initialized.",
        });
        return;
      }

      if (!context.storeId) {
        set({
          error:
            "Store context is not initialized.",
        });
        return;
      }

      set({
        loading: true,
        error: null,
      });

      try {
        const data =
          await dashboardService.getDashboardData(
            context.tenantId,
            context.storeId,
          );

        set({
          data,
          loading: false,
          error: null,
        });
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load dashboard.",
        });
      }
    },
  }));
