import { learningTimetableRepository } from "../repositories/learning-timetable.repository";

export const learningTimetableService = {
  list: learningTimetableRepository.list,
  create: learningTimetableRepository.create,
  setStatus: learningTimetableRepository.setStatus,
  delete: learningTimetableRepository.delete,
};
