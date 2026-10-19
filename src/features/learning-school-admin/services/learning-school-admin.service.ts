import { learningSchoolAdminRepository } from "../repositories/learning-school-admin.repository";
import { learningSchoolAnalyticsRepository } from "../repositories/learning-school-analytics.repository";

export const learningSchoolAdminService = {
  listManageableOrganizations: learningSchoolAdminRepository.listManageableOrganizations,
  listEligibleUsers: learningSchoolAdminRepository.listEligibleUsers,
  getAnalyticsSummary: learningSchoolAnalyticsRepository.getSummary,
};
