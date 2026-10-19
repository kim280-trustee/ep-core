import { learningAttendanceRepository } from "../repositories/learning-attendance.repository";

export const learningAttendanceService = {
  getHistory: learningAttendanceRepository.getHistory,
  getSchoolWideHistory: learningAttendanceRepository.getSchoolWideHistory,
  getRegister: learningAttendanceRepository.getRegister,
  saveRegister: learningAttendanceRepository.saveRegister,
  submitRegister: learningAttendanceRepository.submitRegister,
};
