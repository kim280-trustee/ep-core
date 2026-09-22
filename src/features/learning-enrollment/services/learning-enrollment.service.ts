import { learningEnrollmentRepository } from "../repositories/learning-enrollment.repository";
import type { LearningClassMembershipInput } from "../types/learning-enrollment.types";

export const learningEnrollmentService = {
  listClassMembers: learningEnrollmentRepository.listClassMembers,
  listUserClasses: learningEnrollmentRepository.listUserClasses,
  addMember: (input: LearningClassMembershipInput) => learningEnrollmentRepository.addMember(input),
  updateMember: learningEnrollmentRepository.updateMember,
  removeMember: learningEnrollmentRepository.removeMember,
};