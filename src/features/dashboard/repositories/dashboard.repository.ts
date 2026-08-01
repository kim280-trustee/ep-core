import type {
  DashboardSummary,
} from "../types";

export interface DashboardRepository {

  getSummary(): DashboardSummary;

}