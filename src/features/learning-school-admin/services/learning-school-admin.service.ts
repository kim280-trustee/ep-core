import { learningSchoolAdminRepository } from "../repositories/learning-school-admin.repository";
import { learningSchoolAnalyticsRepository } from "../repositories/learning-school-analytics.repository";

export const learningSchoolAdminService = {
  listManageableOrganizations: learningSchoolAdminRepository.listManageableOrganizations,
  listEligibleUsers: learningSchoolAdminRepository.listEligibleUsers,
  listUsersByIds: learningSchoolAdminRepository.listUsersByIds,
  getAnalyticsSummary: learningSchoolAnalyticsRepository.getSummary,
  listStaff: learningSchoolAdminRepository.listStaff,
  setStaffMembershipStatus: learningSchoolAdminRepository.setStaffMembershipStatus,
};
