/*
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Dashboard Store
 * ============================================================
 */

import {
  create,
} from "zustand";


import {
  dashboardService,
} from "../services";


import {
  storeContext,
} from "@/core/store/store.context";


import type {
  DashboardSummary,
} from "../types";



interface DashboardStore {


  summary: DashboardSummary;


  loadDashboard: () => Promise<void>;


}



const defaultSummary: DashboardSummary = {


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
  create<DashboardStore>((set) => ({


    summary: defaultSummary,


    loadDashboard: async () => {


      const context =
        storeContext.getStore();


      if (!context?.tenantId) {

        throw new Error(
          "Tenant context is not initialized.",
        );

      }


      const summary =
        await dashboardService.getSummary(
          context.tenantId,
        );


      set({

        summary,

      });


    },


  }));
