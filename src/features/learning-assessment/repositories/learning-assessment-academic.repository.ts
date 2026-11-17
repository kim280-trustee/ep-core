import { supabase } from "@/core/infrastructure/supabase/client";

const QUERY_CHUNK_SIZE = 100;

export type QuestionVersionScopeRow = {
  id: string;
  question_id: string;
  version_no: number;
  published_at: string | null;
  curriculum_id: string | null;
  grade_level_id: string | null;
  subject_id: string | null;
};

export type QuestionObjectiveScopeRow = {
  question_version_id: string;
  objective_id: string;
};

export const learningAssessmentAcademicRepository = {
  async listVersionScopeRows(questionIds: string[]): Promise<QuestionVersionScopeRow[]> {
    if (!questionIds.length) return [];
    const chunks = Array.from(
      { length: Math.ceil(questionIds.length / QUERY_CHUNK_SIZE) },
      (_, index) => questionIds.slice(index * QUERY_CHUNK_SIZE, (index + 1) * QUERY_CHUNK_SIZE),
    );
    const results = await Promise.all(chunks.map(async (ids) => {
      const { data, error } = await supabase
        .from("learning_question_versions")
        .select("id,question_id,version_no,published_at,curriculum_id,grade_level_id,subject_id")
        .in("question_id", ids)
        .order("version_no", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuestionVersionScopeRow[];
    }));
    return results.flat();
  },

  async listObjectiveScopeRows(questionVersionIds: string[]): Promise<QuestionObjectiveScopeRow[]> {
    if (!questionVersionIds.length) return [];
    const chunks = Array.from(
      { length: Math.ceil(questionVersionIds.length / QUERY_CHUNK_SIZE) },
      (_, index) => questionVersionIds.slice(index * QUERY_CHUNK_SIZE, (index + 1) * QUERY_CHUNK_SIZE),
    );
    const results = await Promise.all(chunks.map(async (ids) => {
      const { data, error } = await supabase
        .from("learning_question_objectives")
        .select("question_version_id,objective_id")
        .in("question_version_id", ids);
      if (error) throw error;
      return (data ?? []) as QuestionObjectiveScopeRow[];
    }));
    return results.flat();
  },
};
