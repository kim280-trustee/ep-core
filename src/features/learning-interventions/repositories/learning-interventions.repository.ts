import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningInterventionCase,
  LearningInterventionCategory,
  LearningInterventionPriority,
  LearningInterventionStatus,
} from "../types/learning-intervention.types";

type RpcResult = { data: unknown; error: { message: string } | null };
type RawCase = {
  id: string;
  organization_id: string;
  class_group_id: string;
  class_name: string;
  class_code: string;
  student_user_id: string;
  student_name: string;
  category: LearningInterventionCategory;
  priority: LearningInterventionPriority;
  status: LearningInterventionStatus;
  title: string;
  notes: string;
  evidence_reference: string | null;
  review_date: string | null;
  outcome: string | null;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};
const client = supabase as unknown as {
  rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult>;
};

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

function mapCase(row: RawCase): LearningInterventionCase {
  return {
    id: row.id,
    organizationId: row.organization_id,
    classGroupId: row.class_group_id,
    className: row.class_name,
    classCode: row.class_code,
    studentUserId: row.student_user_id,
    studentName: row.student_name,
    category: row.category,
    priority: row.priority,
    status: row.status,
    title: row.title,
    notes: row.notes,
    evidenceReference: row.evidence_reference,
    reviewDate: row.review_date,
    outcome: row.outcome,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
  };
}

export const learningInterventionsRepository = {
  async listCases(classGroupId?: string, status?: LearningInterventionStatus): Promise<LearningInterventionCase[]> {
    const data = await rpc<unknown>("list_learning_intervention_cases", {
      p_class_group_id: classGroupId || null,
      p_status: status || null,
    });
    return Array.isArray(data) ? (data as RawCase[]).map(mapCase) : [];
  },
  async createCase(input: {
    classGroupId: string;
    studentUserId: string;
    category: LearningInterventionCategory;
    priority: LearningInterventionPriority;
    title: string;
    notes: string;
    evidenceReference?: string;
    reviewDate?: string;
  }): Promise<string> {
    const id = await rpc<unknown>("create_learning_intervention_case", {
      p_class_group_id: input.classGroupId,
      p_student_user_id: input.studentUserId,
      p_category: input.category,
      p_priority: input.priority,
      p_title: input.title,
      p_notes: input.notes,
      p_evidence_reference: input.evidenceReference || null,
      p_review_date: input.reviewDate || null,
    });
    if (typeof id !== "string" || !id) throw new Error("The support case was not saved.");
    return id;
  },
  async updateCase(input: {
    caseId: string;
    status: LearningInterventionStatus;
    priority: LearningInterventionPriority;
    notes: string;
    evidenceReference?: string;
    reviewDate?: string;
    outcome?: string;
  }): Promise<boolean> {
    return rpc<boolean>("update_learning_intervention_case", {
      p_case_id: input.caseId,
      p_status: input.status,
      p_priority: input.priority,
      p_notes: input.notes,
      p_evidence_reference: input.evidenceReference || null,
      p_review_date: input.reviewDate || null,
      p_outcome: input.outcome || null,
    });
  },
};
