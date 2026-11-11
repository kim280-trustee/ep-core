import { learningTeacherLeaveRepository } from "../repositories/learning-teacher-leave.repository";

export const learningTeacherLeaveService = {
  listMyRequests: learningTeacherLeaveRepository.listMyRequests,
  listMyCoverages: learningTeacherLeaveRepository.listMyCoverages,
  listManageableRequests: learningTeacherLeaveRepository.listManageableRequests,
  listManageableCoverages: learningTeacherLeaveRepository.listManageableCoverages,
  createRequest: learningTeacherLeaveRepository.createRequest,
  reviewRequest: learningTeacherLeaveRepository.reviewRequest,
  assignSubstitute: learningTeacherLeaveRepository.assignSubstitute,
  cancelCoverage: learningTeacherLeaveRepository.cancelCoverage,
};
