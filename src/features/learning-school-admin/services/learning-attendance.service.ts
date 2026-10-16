import { learningAttendanceRepository } from "../repositories/learning-attendance.repository";

export const learningAttendanceService = {
  getHistory: learningAttendanceRepository.getHistory,
  getOrganizationHistory: learningAttendanceRepository.getOrganizationHistory,
  getRegister: learningAttendanceRepository.getRegister,
  saveRegister: learningAttendanceRepository.saveRegister,
};
