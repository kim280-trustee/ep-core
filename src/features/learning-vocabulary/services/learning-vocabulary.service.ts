import { learningVocabularyRepository } from "../repositories/learning-vocabulary.repository";

export const learningVocabularyService = {
  listEntries: learningVocabularyRepository.listEntries,
  createEntry: learningVocabularyRepository.createEntry,
  updateEntry: learningVocabularyRepository.updateEntry,
  listProgress: learningVocabularyRepository.listProgress,
  saveProgress: learningVocabularyRepository.saveProgress,
};
