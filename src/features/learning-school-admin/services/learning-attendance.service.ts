import { learningAttendanceRepository } from "../repositories/learning-attendance.repository";

export const learningAttendanceService = {
  getHistory: learningAttendanceRepository.getHistory,
  getRegister: learningAttendanceRepository.getRegister,
  saveRegister: learningAttendanceRepository.saveRegister,
};
