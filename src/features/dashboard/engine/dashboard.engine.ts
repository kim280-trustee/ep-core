import {
  dashboardService,
} from "../services";

class DashboardEngine {

  getDashboard() {

    return dashboardService.getSummary();

  }

}

export const dashboardEngine =
  new DashboardEngine();