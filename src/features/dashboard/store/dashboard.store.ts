import {
  create,
} from "zustand";

import {
  dashboardEngine,
} from "../engine";

import type {
  DashboardSummary,
} from "../types";

interface DashboardState {

  summary: DashboardSummary;

  loadDashboard: () => void;

}

const emptySummary: DashboardSummary = {

  totalSales: 0,

  totalPurchases: 0,

  totalRevenue: 0,

  totalProfit: 0,

  inventoryValue: 0,

  lowStockItems: 0,

  totalCustomers: 0,

  totalSuppliers: 0,

};

export const useDashboardStore =

create<DashboardState>((set) => ({

  summary: emptySummary,

  loadDashboard: () => {

    set({

      summary:

        dashboardEngine.getDashboard(),

    });

  },

}));