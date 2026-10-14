export type VocabularyDifficulty = "beginner" | "intermediate" | "advanced";
export type VocabularyEntryStatus = "draft" | "published" | "archived";
export type VocabularyProgressStatus = "learning" | "known";

export interface LearningVocabularyEntry {
  id: string;
  tenantId: string;
  organizationId: string;
  word: string;
  normalizedWord: string;
  definition: string;
  exampleSentence: string | null;
  translation: string | null;
  pronunciation: string | null;
  partOfSpeech: string | null;
  topic: string | null;
  languageCode: string;
  translationLanguageCode: string | null;
  difficulty: VocabularyDifficulty;
  status: VocabularyEntryStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningVocabularyEntryInput {
  tenantId: string;
  organizationId: string;
  word: string;
  definition: string;
  exampleSentence?: string | null;
  translation?: string | null;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  topic?: string | null;
  languageCode: string;
  translationLanguageCode?: string | null;
  difficulty: VocabularyDifficulty;
  status: VocabularyEntryStatus;
  createdBy: string;
  updatedBy: string;
}

export type LearningVocabularyEntryUpdate = Partial<Omit<LearningVocabularyEntryInput, "tenantId" | "organizationId" | "createdBy">> & {
  updatedBy: string;
};

export interface LearningVocabularyProgress {
  id: string;
  tenantId: string;
  organizationId: string;
  userId: string;
  vocabularyEntryId: string;
  status: VocabularyProgressStatus;
  lastPracticedAt: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  lastAnswerCorrect: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningVocabularyProgressInput {
  tenantId: string;
  organizationId: string;
  userId: string;
  vocabularyEntryId: string;
  status: VocabularyProgressStatus;
}

export interface LearningVocabularyTranslation {
  id: string;
  tenantId: string;
  organizationId: string;
  vocabularyEntryId: string;
  languageCode: string;
  translation: string;
  pronunciation: string | null;
  transliteration: string | null;
  audioUrl: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type LearningVocabularyTranslationInput = Omit<
  LearningVocabularyTranslation,
  "id" | "createdAt" | "updatedAt"
>;

export interface LearningVocabularyExample {
  id: string;
  tenantId: string;
  organizationId: string;
  vocabularyEntryId: string;
  languageCode: string;
  sentence: string;
  translationLanguageCode: string | null;
  translatedSentence: string | null;
  sequenceNo: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type LearningVocabularyExampleInput = Omit<
  LearningVocabularyExample,
  "id" | "createdAt" | "updatedAt"
>;

export interface LearningVocabularyObjectiveLink {
  id: string;
  tenantId: string;
  organizationId: string;
  vocabularyEntryId: string;
  objectiveId: string;
  createdBy: string;
  createdAt: string;
}

export type LearningVocabularyObjectiveLinkInput = Omit<
  LearningVocabularyObjectiveLink,
  "id" | "createdAt"
>;
