import {
  dashboardRepository,
} from "../repositories";

class DashboardService {

  getSummary() {

    return dashboardRepository.getSummary();

  }

}

export const dashboardService =
  new DashboardService();