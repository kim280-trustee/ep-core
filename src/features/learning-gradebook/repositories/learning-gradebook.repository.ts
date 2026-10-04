import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningGradebookEntry,
  LearningGradebookQuery,
  LearningTermGrade,
} from "../types/learning-gradebook.types";

type GradebookRow = {
  id: string;
  tenant_id: string;
  organization_id: string;
  term_id: string;
  class_group_id: string;
  class_subject_id: string;
  student_user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  record_type: string;
  source_type: string;
  assignment_id: string | null;
  assessment_id: string | null;
  attempt_id: string | null;
  assessment_result_id: string | null;
  topic_id: string | null;
  objective_id: string | null;
  score: number | string;
  max_score: number | string;
  percentage: number | string | null;
  weight: number | string;
  included_in_grade: boolean;
  recorded_at: string;
  notes: Record<string, unknown>;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  comment: string | null;
  late: boolean;
};

type TermGradeRow = {
  id: string;
  tenant_id: string;
  organization_id: string;
  term_id: string;
  class_group_id: string;
  class_subject_id: string;
  student_user_id: string;
  score: number | string;
  letter_grade: string | null;
  status: string;
  calculation: Record<string, unknown>;
  finalized_at: string | null;
  finalized_by: string | null;
  notes: Record<string, unknown>;
  override_score: number | string | null;
  override_grade: string | null;
  override_reason: string | null;
};

const gradebookClient = supabase as unknown as {
  from(table: "learning_gradebook_entries"): {
    select(columns: string): {
      eq(column: string, value: string): {
        order(column: string, options?: { ascending?: boolean }): PromiseLike<{ data: GradebookRow[] | null; error: Error | null }>;
      };
    };
  };
};

const termGradeClient = supabase as unknown as {
  from(table: "learning_term_grades"): {
    select(columns: string): {
      eq(column: string, value: string): {
        order(column: string, options?: { ascending?: boolean }): PromiseLike<{ data: TermGradeRow[] | null; error: Error | null }>;
      };
    };
  };
};

const toNumber = (value: number | string | null) =>
  value === null ? null : Number(value);

const mapEntry = (row: GradebookRow): LearningGradebookEntry => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  termId: row.term_id,
  classGroupId: row.class_group_id,
  classSubjectId: row.class_subject_id,
  studentUserId: row.student_user_id,
  categoryId: row.category_id,
  title: row.title,
  description: row.description,
  recordType: row.record_type,
  sourceType: row.source_type,
  assignmentId: row.assignment_id,
  assessmentId: row.assessment_id,
  attemptId: row.attempt_id,
  assessmentResultId: row.assessment_result_id,
  topicId: row.topic_id,
  objectiveId: row.objective_id,
  score: Number(row.score),
  maxScore: Number(row.max_score),
  percentage: toNumber(row.percentage),
  weight: Number(row.weight),
  includedInGrade: row.included_in_grade,
  recordedAt: row.recorded_at,
  notes: row.notes ?? {},
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  status: row.status,
  comment: row.comment,
  late: row.late,
});

const mapTermGrade = (row: TermGradeRow): LearningTermGrade => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  termId: row.term_id,
  classGroupId: row.class_group_id,
  classSubjectId: row.class_subject_id,
  studentUserId: row.student_user_id,
  score: Number(row.score),
  letterGrade: row.letter_grade,
  status: row.status,
  calculation: row.calculation ?? {},
  finalizedAt: row.finalized_at,
  finalizedBy: row.finalized_by,
  notes: row.notes ?? {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  overrideScore: toNumber(row.override_score),
  overrideGrade: row.override_grade,
  overrideReason: row.override_reason,
});

export const learningGradebookRepository = {
  async listEntries(input: LearningGradebookQuery) {
    let query = gradebookClient
      .from("learning_gradebook_entries")
      .select("*")
      .eq("organization_id", input.organizationId)
      .eq("class_group_id", input.classGroupId)
      .eq("class_subject_id", input.classSubjectId)
      .eq("term_id", input.termId);

    const { data, error } = await query.order("recorded_at", {
      ascending: false,
    });

    if (error) throw error;
    return (data ?? []).map(mapEntry);
  },

  async listTermGrades(input: LearningGradebookQuery) {
    let query = termGradeClient
      .from("learning_term_grades")
      .select("*")
      .eq("organization_id", input.organizationId)
      .eq("class_group_id", input.classGroupId)
      .eq("class_subject_id", input.classSubjectId)
      .eq("term_id", input.termId);

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) throw error;
    return (data ?? []).map(mapTermGrade);
  },
};
