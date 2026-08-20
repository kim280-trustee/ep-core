/*
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


  async getSummary(
    tenantId: string,
  ) {


    return await inMemoryDashboardRepository
      .getSummary(
        tenantId,
      );


  }


}


export const dashboardService =
  new DashboardService();
