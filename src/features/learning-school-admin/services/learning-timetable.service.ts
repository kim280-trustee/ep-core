import { learningTimetableRepository } from "../repositories/learning-timetable.repository";

export const learningTimetableService = {
  list: learningTimetableRepository.list,
  listForCurrentTeacher: learningTimetableRepository.listForCurrentTeacher,
  create: learningTimetableRepository.create,
  setStatus: learningTimetableRepository.setStatus,
  delete: learningTimetableRepository.delete,
};
