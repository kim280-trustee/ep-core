import { learningPackImportRepository } from "../repositories/learning-pack-import.repository";

export const learningPackImportService = {
  findExistingImportCodes: (input: Parameters<typeof learningPackImportRepository.findExistingImportCodes>[0]) =>
    learningPackImportRepository.findExistingImportCodes(input),
  verifyExistingQuestionImports: (input: Parameters<typeof learningPackImportRepository.verifyExistingQuestionImports>[0]) =>
    learningPackImportRepository.verifyExistingQuestionImports(input),
  findIncompleteExistingContentCodes: (input: Parameters<typeof learningPackImportRepository.findIncompleteExistingContentCodes>[0]) =>
    learningPackImportRepository.findIncompleteExistingContentCodes(input),
  importChunk: (input: Parameters<typeof learningPackImportRepository.importChunk>[0]) =>
    learningPackImportRepository.importChunk(input),
  importQuestionsOnly: (input: Parameters<typeof learningPackImportRepository.importQuestionsOnly>[0]) =>
    learningPackImportRepository.importQuestionsOnly(input),
};
