import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningVocabularyEntry,
  LearningVocabularyEntryInput,
  LearningVocabularyEntryUpdate,
  LearningVocabularyProgress,
  LearningVocabularyProgressInput,
} from "../types/learning-vocabulary.types";

type EntryRow = Database["public"]["Tables"]["learning_vocabulary_entries"]["Row"];
type ProgressRow = Database["public"]["Tables"]["learning_vocabulary_progress"]["Row"];

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
  createdAt: row.created_at,
  updatedAt: row.updated_at,
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

  async saveProgress(input: LearningVocabularyProgressInput): Promise<LearningVocabularyProgress> {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("learning_vocabulary_progress").upsert({
      tenant_id: input.tenantId,
      organization_id: input.organizationId,
      user_id: input.userId,
      vocabulary_entry_id: input.vocabularyEntryId,
      status: input.status,
      last_practiced_at: now,
      updated_at: now,
    }, { onConflict: "organization_id,user_id,vocabulary_entry_id" }).select("*").single();
    if (error) throw error;
    return mapProgress(data);
  },
};
