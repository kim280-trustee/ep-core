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
