import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningVocabularyEntry,
  LearningVocabularyEntryInput,
  LearningVocabularyEntryUpdate,
  LearningVocabularyProgress,
  LearningVocabularyProgressInput,
  LearningVocabularyTranslation,
  LearningVocabularyTranslationInput,
  LearningVocabularyExample,
  LearningVocabularyExampleInput,
  LearningVocabularyObjectiveLink,
  LearningVocabularyObjectiveLinkInput,
} from "../types/learning-vocabulary.types";

type EntryRow = Database["public"]["Tables"]["learning_vocabulary_entries"]["Row"];
type ProgressRow = Database["public"]["Tables"]["learning_vocabulary_progress"]["Row"];
type TranslationRow = Database["public"]["Tables"]["learning_vocabulary_translations"]["Row"];
type ExampleRow = Database["public"]["Tables"]["learning_vocabulary_examples"]["Row"];
type ObjectiveLinkRow = Database["public"]["Tables"]["learning_vocabulary_objectives"]["Row"];

const mapEntry = (row: EntryRow): LearningVocabularyEntry => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  word: row.word,
  normalizedWord: row.normalized_word,
  definition: row.definition,
  exampleSentence: row.example_sentence,
  translation: row.translation,
  pronunciation: row.pronunciation,
  partOfSpeech: row.part_of_speech,
  topic: row.topic,
  languageCode: row.language_code,
  translationLanguageCode: row.translation_language_code,
  difficulty: row.difficulty as LearningVocabularyEntry["difficulty"],
  status: row.status as LearningVocabularyEntry["status"],
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapProgress = (row: ProgressRow): LearningVocabularyProgress => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  userId: row.user_id,
  vocabularyEntryId: row.vocabulary_entry_id,
  status: row.status as LearningVocabularyProgress["status"],
  lastPracticedAt: row.last_practiced_at,
  reviewCount: row.review_count,
  correctCount: row.correct_count,
  incorrectCount: row.incorrect_count,
  intervalDays: row.interval_days,
  easeFactor: Number(row.ease_factor),
  nextReviewAt: row.next_review_at,
  lastAnswerCorrect: row.last_answer_correct,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTranslation = (row: TranslationRow): LearningVocabularyTranslation => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  vocabularyEntryId: row.vocabulary_entry_id,
  languageCode: row.language_code,
  translation: row.translation,
  pronunciation: row.pronunciation,
  transliteration: row.transliteration,
  audioUrl: row.audio_url,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapExample = (row: ExampleRow): LearningVocabularyExample => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  vocabularyEntryId: row.vocabulary_entry_id,
  languageCode: row.language_code,
  sentence: row.sentence,
  translationLanguageCode: row.translation_language_code,
  translatedSentence: row.translated_sentence,
  sequenceNo: row.sequence_no,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapObjectiveLink = (row: ObjectiveLinkRow): LearningVocabularyObjectiveLink => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  vocabularyEntryId: row.vocabulary_entry_id,
  objectiveId: row.objective_id,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

export const learningVocabularyRepository = {
  async listEntries(organizationId: string, includeUnpublished: boolean): Promise<LearningVocabularyEntry[]> {
    let query = supabase
      .from("learning_vocabulary_entries")
      .select("*")
      .eq("organization_id", organizationId)
      .order("word", { ascending: true });
    if (!includeUnpublished) query = query.eq("status", "published");
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapEntry);
  },

  async createEntry(input: LearningVocabularyEntryInput): Promise<LearningVocabularyEntry> {
    const { data, error } = await supabase.from("learning_vocabulary_entries").insert({
      tenant_id: input.tenantId,
      organization_id: input.organizationId,
      word: input.word.trim(),
      definition: input.definition.trim(),
      example_sentence: input.exampleSentence?.trim() || null,
      translation: input.translation?.trim() || null,
      pronunciation: input.pronunciation?.trim() || null,
      part_of_speech: input.partOfSpeech?.trim() || null,
      topic: input.topic?.trim() || null,
      language_code: input.languageCode.trim().toLowerCase(),
      translation_language_code: input.translationLanguageCode?.trim().toLowerCase() || null,
      difficulty: input.difficulty,
      status: input.status,
      created_by: input.createdBy,
      updated_by: input.updatedBy,
    }).select("*").single();
    if (error) throw error;
    return mapEntry(data);
  },

  async updateEntry(id: string, updates: LearningVocabularyEntryUpdate): Promise<LearningVocabularyEntry> {
    const patch: Database["public"]["Tables"]["learning_vocabulary_entries"]["Update"] = {
      updated_by: updates.updatedBy,
      updated_at: new Date().toISOString(),
    };
    if (updates.word !== undefined) patch.word = updates.word.trim();
    if (updates.definition !== undefined) patch.definition = updates.definition.trim();
    if (updates.exampleSentence !== undefined) patch.example_sentence = updates.exampleSentence?.trim() || null;
    if (updates.translation !== undefined) patch.translation = updates.translation?.trim() || null;
    if (updates.pronunciation !== undefined) patch.pronunciation = updates.pronunciation?.trim() || null;
    if (updates.partOfSpeech !== undefined) patch.part_of_speech = updates.partOfSpeech?.trim() || null;
    if (updates.topic !== undefined) patch.topic = updates.topic?.trim() || null;
    if (updates.languageCode !== undefined) patch.language_code = updates.languageCode.trim().toLowerCase();
    if (updates.translationLanguageCode !== undefined) patch.translation_language_code = updates.translationLanguageCode?.trim().toLowerCase() || null;
    if (updates.difficulty !== undefined) patch.difficulty = updates.difficulty;
    if (updates.status !== undefined) patch.status = updates.status;
    const { data, error } = await supabase.from("learning_vocabulary_entries").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return mapEntry(data);
  },

  async listProgress(organizationId: string, userId: string): Promise<LearningVocabularyProgress[]> {
    const { data, error } = await supabase
      .from("learning_vocabulary_progress")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map(mapProgress);
  },

  async recordReview(input: { organizationId: string; vocabularyEntryId: string; isCorrect: boolean }): Promise<LearningVocabularyProgress> {
    const { data, error } = await supabase.rpc("record_learning_vocabulary_review", {
      p_organization_id: input.organizationId,
      p_vocabulary_entry_id: input.vocabularyEntryId,
      p_is_correct: input.isCorrect,
    });
    if (error) throw error;
    if (!data) throw new Error("Vocabulary review did not return updated progress.");
    return mapProgress(data);
  },

  async listTranslations(organizationId: string, vocabularyEntryId: string): Promise<LearningVocabularyTranslation[]> {
    const { data, error } = await supabase.from("learning_vocabulary_translations")
      .select("*").eq("organization_id", organizationId).eq("vocabulary_entry_id", vocabularyEntryId)
      .order("language_code", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapTranslation);
  },

  async createTranslation(input: LearningVocabularyTranslationInput): Promise<LearningVocabularyTranslation> {
    const { data, error } = await supabase.from("learning_vocabulary_translations").insert({
      tenant_id: input.tenantId, organization_id: input.organizationId,
      vocabulary_entry_id: input.vocabularyEntryId, language_code: input.languageCode.trim().toLowerCase(),
      translation: input.translation.trim(), pronunciation: input.pronunciation?.trim() || null,
      transliteration: input.transliteration?.trim() || null, audio_url: input.audioUrl?.trim() || null,
      created_by: input.createdBy, updated_by: input.updatedBy,
    }).select("*").single();
    if (error) throw error;
    return mapTranslation(data);
  },

  async updateTranslation(id: string, input: Pick<LearningVocabularyTranslationInput, "translation" | "pronunciation" | "transliteration" | "audioUrl" | "updatedBy">): Promise<LearningVocabularyTranslation> {
    const { data, error } = await supabase.from("learning_vocabulary_translations").update({
      translation: input.translation.trim(), pronunciation: input.pronunciation?.trim() || null,
      transliteration: input.transliteration?.trim() || null, audio_url: input.audioUrl?.trim() || null,
      updated_by: input.updatedBy, updated_at: new Date().toISOString(),
    }).eq("id", id).select("*").single();
    if (error) throw error;
    return mapTranslation(data);
  },

  async listExamples(organizationId: string, vocabularyEntryId: string): Promise<LearningVocabularyExample[]> {
    const { data, error } = await supabase.from("learning_vocabulary_examples").select("*")
      .eq("organization_id", organizationId).eq("vocabulary_entry_id", vocabularyEntryId)
      .order("sequence_no", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapExample);
  },

  async createExample(input: LearningVocabularyExampleInput): Promise<LearningVocabularyExample> {
    const { data, error } = await supabase.from("learning_vocabulary_examples").insert({
      tenant_id: input.tenantId, organization_id: input.organizationId,
      vocabulary_entry_id: input.vocabularyEntryId, language_code: input.languageCode.trim().toLowerCase(),
      sentence: input.sentence.trim(), translation_language_code: input.translationLanguageCode?.trim().toLowerCase() || null,
      translated_sentence: input.translatedSentence?.trim() || null, sequence_no: input.sequenceNo,
      created_by: input.createdBy, updated_by: input.updatedBy,
    }).select("*").single();
    if (error) throw error;
    return mapExample(data);
  },

  async updateExample(id: string, input: Pick<LearningVocabularyExampleInput, "sentence" | "languageCode" | "translationLanguageCode" | "translatedSentence" | "sequenceNo" | "updatedBy">): Promise<LearningVocabularyExample> {
    const { data, error } = await supabase.from("learning_vocabulary_examples").update({
      sentence: input.sentence.trim(), language_code: input.languageCode.trim().toLowerCase(),
      translation_language_code: input.translationLanguageCode?.trim().toLowerCase() || null,
      translated_sentence: input.translatedSentence?.trim() || null, sequence_no: input.sequenceNo,
      updated_by: input.updatedBy, updated_at: new Date().toISOString(),
    }).eq("id", id).select("*").single();
    if (error) throw error;
    return mapExample(data);
  },

  async deleteExample(id: string): Promise<void> {
    const { error } = await supabase.from("learning_vocabulary_examples").delete().eq("id", id);
    if (error) throw error;
  },

  async listObjectiveLinks(organizationId: string, vocabularyEntryId: string): Promise<LearningVocabularyObjectiveLink[]> {
    const { data, error } = await supabase.from("learning_vocabulary_objectives").select("*")
      .eq("organization_id", organizationId).eq("vocabulary_entry_id", vocabularyEntryId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapObjectiveLink);
  },

  async linkObjective(input: LearningVocabularyObjectiveLinkInput): Promise<LearningVocabularyObjectiveLink> {
    const { data, error } = await supabase.from("learning_vocabulary_objectives").insert({
      tenant_id: input.tenantId, organization_id: input.organizationId,
      vocabulary_entry_id: input.vocabularyEntryId, objective_id: input.objectiveId,
      created_by: input.createdBy,
    }).select("*").single();
    if (error) throw error;
    return mapObjectiveLink(data);
  },

  async unlinkObjective(id: string): Promise<void> {
    const { error } = await supabase.from("learning_vocabulary_objectives").delete().eq("id", id);
    if (error) throw error;
  },
};
