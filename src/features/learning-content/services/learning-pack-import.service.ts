import { learningPackImportRepository } from "../repositories/learning-pack-import.repository";

export const learningPackImportService = {
  importChunk: (input: Parameters<typeof learningPackImportRepository.importChunk>[0]) =>
    learningPackImportRepository.importChunk(input),
};
