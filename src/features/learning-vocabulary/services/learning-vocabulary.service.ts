import { learningVocabularyRepository } from "../repositories/learning-vocabulary.repository";

export const learningVocabularyService = {
  listEntries: learningVocabularyRepository.listEntries,
  createEntry: learningVocabularyRepository.createEntry,
  updateEntry: learningVocabularyRepository.updateEntry,
  listProgress: learningVocabularyRepository.listProgress,
  recordReview: learningVocabularyRepository.recordReview,
  listTranslations: learningVocabularyRepository.listTranslations,
  createTranslation: learningVocabularyRepository.createTranslation,
  updateTranslation: learningVocabularyRepository.updateTranslation,
  listExamples: learningVocabularyRepository.listExamples,
  createExample: learningVocabularyRepository.createExample,
  updateExample: learningVocabularyRepository.updateExample,
  deleteExample: learningVocabularyRepository.deleteExample,
  listObjectiveLinks: learningVocabularyRepository.listObjectiveLinks,
  linkObjective: learningVocabularyRepository.linkObjective,
  unlinkObjective: learningVocabularyRepository.unlinkObjective,
};
