import {
  learningGradebookRepository,
} from "../repositories/learning-gradebook.repository";

export const learningGradebookService = {
  listEntries: learningGradebookRepository.listEntries,
  listTermGrades: learningGradebookRepository.listTermGrades,
  listCategories: learningGradebookRepository.listCategories,
  createManualEntry: learningGradebookRepository.createManualEntry,
  updateManualEntry: learningGradebookRepository.updateManualEntry,
  setEntryIncludedInGrade: learningGradebookRepository.setEntryIncludedInGrade,
  deleteManualEntry: learningGradebookRepository.deleteManualEntry,
};
