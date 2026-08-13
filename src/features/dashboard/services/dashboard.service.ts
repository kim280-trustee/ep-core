/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Dashboard Service
 * ============================================================
 */

import {
  inMemoryDashboardRepository,
} from "../repositories";


class DashboardService {


  async getSummary() {


    return await inMemoryDashboardRepository
      .getSummary();


  }


}


export const dashboardService =
new DashboardService();