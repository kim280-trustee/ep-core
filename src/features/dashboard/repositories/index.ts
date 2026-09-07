import { inMemoryDashboardRepository } from "./in-memory.dashboard.repository";

export const dashboardRepository =
  inMemoryDashboardRepository;

export type {
  DashboardRepository,
} from "./dashboard.repository";
