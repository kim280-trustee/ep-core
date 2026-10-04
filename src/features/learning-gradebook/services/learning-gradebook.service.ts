import { learningGradebookRepository } from "../repositories/learning-gradebook.repository";

export const learningGradebookService = {
  listEntries: learningGradebookRepository.listEntries,
  listTermGrades: learningGradebookRepository.listTermGrades,
};
