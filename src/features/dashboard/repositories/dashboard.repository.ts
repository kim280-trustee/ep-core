import type { DashboardData } from "../types";

export interface DashboardRepository {
  getDashboardData(
    tenantId: string,
    storeId: string,
  ): Promise<DashboardData>;
}
