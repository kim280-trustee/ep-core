import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  CreateManualGradebookEntryInput,
  LearningGradebookCategory,
  LearningGradebookEntry,
  LearningGradebookQuery,
  LearningTermGrade,
  UpdateManualGradebookEntryInput,
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
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string | null;
  default_weight: number | string;
  status: string;
  created_at: string;
  updated_at: string;
};

type GradebookQueryBuilder = {
  eq(column: string, value: string): GradebookQueryBuilder;
  order(
    column: string,
    options?: { ascending?: boolean },
  ): PromiseLike<{ data: GradebookRow[] | null; error: Error | null }>;
};

type TermGradeQueryBuilder = {
  eq(column: string, value: string): TermGradeQueryBuilder;
  order(
    column: string,
    options?: { ascending?: boolean },
  ): PromiseLike<{ data: TermGradeRow[] | null; error: Error | null }>;
};

type CategoryQueryBuilder = {
  eq(column: string, value: string): CategoryQueryBuilder;
  order(
    column: string,
    options?: { ascending?: boolean },
  ): PromiseLike<{ data: CategoryRow[] | null; error: Error | null }>;
};

type SingleRowResult = PromiseLike<{
  data: GradebookRow | null;
  error: Error | null;
}>;

type MutationFilterBuilder = {
  eq(column: string, value: string | boolean): MutationFilterBuilder;
  select(columns: string): {
    single(): SingleRowResult;
    maybeSingle(): PromiseLike<{
      data: Pick<GradebookRow, "id"> | null;
      error: Error | null;
    }>;
  };
};

type GradebookMutationClient = {
  from(table: "learning_gradebook_entries"): {
    insert(values: Record<string, unknown>): {
      select(columns: string): { single(): SingleRowResult };
    };
    update(values: Record<string, unknown>): MutationFilterBuilder;
    delete(): MutationFilterBuilder;
  };
};

const gradebookClient = supabase as unknown as {
  from(table: "learning_gradebook_entries"): GradebookQueryBuilder &
    ReturnType<GradebookMutationClient["from"]>;
};

const termGradeClient = supabase as unknown as {
  from(table: "learning_term_grades"): TermGradeQueryBuilder & {
    select(columns: string): TermGradeQueryBuilder;
  };
};

const categoryClient = supabase as unknown as {
  from(table: "learning_gradebook_categories"): CategoryQueryBuilder & {
    select(columns: string): CategoryQueryBuilder;
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

const mapCategory = (row: CategoryRow): LearningGradebookCategory => ({
  id: row.id,
  organizationId: row.organization_id,
  code: row.code,
  name: row.name,
  description: row.description,
  defaultWeight: Number(row.default_weight),
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

function assertValidScore(score: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore)) {
    throw new Error("Score and maximum score must be valid numbers.");
  }
  if (maxScore <= 0) {
    throw new Error("Maximum score must be greater than zero.");
  }
  if (score < 0 || score > maxScore) {
    throw new Error("Score must be between zero and the maximum score.");
  }
}

function assertTitle(title: string) {
  if (!title.trim()) {
    throw new Error("A title is required.");
  }
}

export const learningGradebookRepository = {
  async listEntries(input: LearningGradebookQuery) {
    const query = gradebookClient
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
    const query = termGradeClient
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

  async listCategories(organizationId: string) {
    const query = categoryClient
      .from("learning_gradebook_categories")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "active");

    const { data, error } = await query.order("name", {
      ascending: true,
    });

    if (error) throw error;
    return (data ?? []).map(mapCategory);
  },

  async createManualEntry(input: CreateManualGradebookEntryInput) {
    assertTitle(input.title);
    assertValidScore(input.score, input.maxScore);

    const percentage = Number(
      ((input.score / input.maxScore) * 100).toFixed(4),
    );

    const { data, error } = await gradebookClient
      .from("learning_gradebook_entries")
      .insert({
        tenant_id: input.tenantId,
        organization_id: input.organizationId,
        term_id: input.termId,
        class_group_id: input.classGroupId,
        class_subject_id: input.classSubjectId,
        student_user_id: input.studentUserId,
        category_id: input.categoryId,
        title: input.title.trim(),
        description: input.description ?? null,
        record_type: input.recordType,
        source_type: "manual",
        assignment_id: null,
        assessment_id: null,
        attempt_id: null,
        assessment_result_id: null,
        topic_id: null,
        objective_id: null,
        score: input.score,
        max_score: input.maxScore,
        percentage,
        weight: input.weight ?? 1,
        included_in_grade: true,
        recorded_at: input.recordedAt,
        notes: input.notes ?? {},
        created_by: input.createdBy,
        updated_by: null,
        status: "graded",
        comment: input.comment ?? null,
        late: input.late ?? false,
      })
      .select("*")
      .single();

    if (error) throw error;
    if (!data) throw new Error("The manual grade could not be created.");
    return mapEntry(data);
  },

  async updateManualEntry(
    entryId: string,
    input: UpdateManualGradebookEntryInput,
  ) {
    assertTitle(input.title);
    assertValidScore(input.score, input.maxScore);

    const percentage = Number(
      ((input.score / input.maxScore) * 100).toFixed(4),
    );

    const { data, error } = await gradebookClient
      .from("learning_gradebook_entries")
      .update({
        category_id: input.categoryId,
        title: input.title.trim(),
        description: input.description ?? null,
        record_type: input.recordType,
        score: input.score,
        max_score: input.maxScore,
        percentage,
        weight: input.weight ?? 1,
        recorded_at: input.recordedAt,
        notes: input.notes ?? {},
        updated_by: input.updatedBy,
        comment: input.comment ?? null,
        late: input.late ?? false,
      })
      .eq("id", entryId)
      .eq("source_type", "manual")
      .select("*")
      .single();

    if (error) throw error;
    if (!data) throw new Error("The manual grade could not be updated.");
    return mapEntry(data);
  },

  async setEntryIncludedInGrade(
    entryId: string,
    includedInGrade: boolean,
    updatedBy: string,
  ) {
    const { data, error } = await gradebookClient
      .from("learning_gradebook_entries")
      .update({
        included_in_grade: includedInGrade,
        updated_by: updatedBy,
      })
      .eq("id", entryId)
      .eq("source_type", "manual")
      .select("*")
      .single();

    if (error) throw error;
    if (!data) throw new Error("The gradebook record could not be updated.");
    return mapEntry(data);
  },

  async deleteManualEntry(entryId: string) {
    const { data, error } = await gradebookClient
      .from("learning_gradebook_entries")
      .delete()
      .eq("id", entryId)
      .eq("source_type", "manual")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error("Only manually entered gradebook records can be deleted.");
    }
  },
};
