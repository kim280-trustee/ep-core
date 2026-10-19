import { learningSchoolAdminRepository } from "../repositories/learning-school-admin.repository";

export const learningSchoolAdminService = {
  listManageableOrganizations: learningSchoolAdminRepository.listManageableOrganizations,
  listEligibleUsers: learningSchoolAdminRepository.listEligibleUsers,
};
\nexport { learningSchoolAnalyticsRepository } from "../repositories/learning-school-analytics.repository";\n