import { learningPackImportRepository } from "../repositories/learning-pack-import.repository";

export const learningPackImportService = {
  importChunk: (input: Parameters<typeof learningPackImportRepository.importChunk>[0]) =>
    learningPackImportRepository.importChunk(input),
  importQuestionsOnly: (input: Parameters<typeof learningPackImportRepository.importQuestionsOnly>[0]) =>
    learningPackImportRepository.importQuestionsOnly(input),
};
