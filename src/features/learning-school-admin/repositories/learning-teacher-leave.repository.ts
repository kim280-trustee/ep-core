import { supabase } from "@/core/infrastructure/supabase/client";
import type { Database } from "@/core/database/database.types";
import type {
  AssignLearningTeacherSubstituteInput,
  CreateLearningTeacherLeaveRequestInput,
  LearningTeacherLeaveRequest,
  LearningTeacherSubstituteCoverage,
  ReviewLearningTeacherLeaveInput,
} from "../types/learning-teacher-leave.types";

type LeaveRow = Database["public"]["Tables"]["learning_teacher_leave_requests"]["Row"];
type CoverageRow = Database["public"]["Tables"]["learning_teacher_substitute_coverages"]["Row"];

function mapLeave(row: LeaveRow): LearningTeacherLeaveRequest {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    organizationId: row.organization_id,
    teacherUserId: row.teacher_user_id,
    startDate: row.start_date,
    endDate: row.end_date,
    leaveType: row.leave_type as LearningTeacherLeaveRequest["leaveType"],
    reason: row.reason,
    status: row.status as LearningTeacherLeaveRequest["status"],
    reviewNote: row.review_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCoverage(row: CoverageRow): LearningTeacherSubstituteCoverage {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    organizationId: row.organization_id,
    leaveRequestId: row.leave_request_id,
    timetableEntryId: row.timetable_entry_id,
    classGroupId: row.class_group_id,
    coverageDate: row.coverage_date,
    absentTeacherUserId: row.absent_teacher_user_id,
    substituteTeacherUserId: row.substitute_teacher_user_id,
    status: row.status as LearningTeacherSubstituteCoverage["status"],
    notes: row.notes,
    assignedBy: row.assigned_by,
    assignedAt: row.assigned_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const learningTeacherLeaveRepository = {
  async listMyRequests(): Promise<LearningTeacherLeaveRequest[]> {
    const { data, error } = await supabase
      .from("learning_teacher_leave_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapLeave);
  },

  async listMyCoverages(): Promise<LearningTeacherSubstituteCoverage[]> {
    const { data, error } = await supabase
      .from("learning_teacher_substitute_coverages")
      .select("*")
      .eq("status", "assigned")
      .order("coverage_date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCoverage);
  },

  async listManageableRequests(organizationId: string): Promise<LearningTeacherLeaveRequest[]> {
    const { data, error } = await supabase
      .from("learning_teacher_leave_requests")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapLeave);
  },

  async listManageableCoverages(organizationId: string): Promise<LearningTeacherSubstituteCoverage[]> {
    const { data, error } = await supabase
      .from("learning_teacher_substitute_coverages")
      .select("*")
      .eq("organization_id", organizationId)
      .order("coverage_date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCoverage);
  },

  async createRequest(input: CreateLearningTeacherLeaveRequestInput): Promise<string> {
    const { data, error } = await supabase.rpc("create_learning_teacher_leave_request", {
      p_organization_id: input.organizationId,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_leave_type: input.leaveType,
      p_reason: input.reason,
    });
    if (error) throw error;
    if (!data) throw new Error("The leave request was not created.");
    return data;
  },

  async reviewRequest(input: ReviewLearningTeacherLeaveInput): Promise<string> {
    const { data, error } = await supabase.rpc("review_learning_teacher_leave_request", {
      p_request_id: input.requestId,
      p_decision: input.decision,
      p_review_note: input.reviewNote ?? null,
    });
    if (error) throw error;
    if (!data) throw new Error("The leave request was not reviewed.");
    return data;
  },

  async assignSubstitute(input: AssignLearningTeacherSubstituteInput): Promise<string> {
    const { data, error } = await supabase.rpc("assign_learning_teacher_substitute", {
      p_leave_request_id: input.leaveRequestId,
      p_timetable_entry_id: input.timetableEntryId,
      p_coverage_date: input.coverageDate,
      p_substitute_teacher_user_id: input.substituteTeacherUserId,
      p_notes: input.notes ?? null,
    });
    if (error) throw error;
    if (!data) throw new Error("Substitute coverage was not assigned.");
    return data;
  },

  async cancelCoverage(coverageId: string): Promise<string> {
    const { data, error } = await supabase.rpc("cancel_learning_teacher_substitute_coverage", {
      p_coverage_id: coverageId,
    });
    if (error) throw error;
    if (!data) throw new Error("Substitute coverage was not cancelled.");
    return data;
  },
};
