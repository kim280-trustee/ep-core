import { learningAttendanceRepository } from "../repositories/learning-attendance.repository";

export const learningAttendanceService = {
  getRegister: learningAttendanceRepository.getRegister,
  saveRegister: learningAttendanceRepository.saveRegister,
};
