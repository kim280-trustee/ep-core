import { learningTeacherRepository } from "../repositories/learning-teacher.repository";
export const learningTeacherService = {
  listTeacherClasses: (userId: string) => learningTeacherRepository.listTeacherClasses(userId),
  getClassOverview: (userId: string, classGroupId: string) => learningTeacherRepository.getClassOverview(userId, classGroupId),
  getStudentProfile: (userId: string, classGroupId: string, studentUserId: string) => learningTeacherRepository.getStudentProfile(userId, classGroupId, studentUserId),
};
