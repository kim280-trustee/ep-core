/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Dashboard Repository
 * ============================================================
 */

import type {
  DashboardSummary,
} from "../types";


export interface DashboardRepository {


  getSummary(): Promise<DashboardSummary>;


}