import { dashboardRepository } from "../repositories";
import type { DashboardData } from "../types";

class DashboardService {
  async getDashboardData(
    tenantId: string,
    storeId: string,
  ): Promise<DashboardData> {
    return dashboardRepository.getDashboardData(
      tenantId,
      storeId,
    );
  }
}

export const dashboardService =
  new DashboardService();
