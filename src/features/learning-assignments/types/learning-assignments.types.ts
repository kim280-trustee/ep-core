import type { Json } from "@/core/database/database.types";

export type LearningAssignmentStatus = "draft" | "published" | "closed" | "archived";
export type LearningAssignmentItemType = "content" | "assessment";
export type LearningAssignmentTargetType = "student" | "class";
export type LearningAssignmentTargetStatus = "active" | "removed";
export type LearningAssignmentProgressStatus = "not_started" | "in_progress" | "completed" | "overdue";

export interface LearningAssignment {
  id:string; tenantId:string; organizationId:string; classSubjectId:string|null; code:string; title:string;
  description:string|null; status:LearningAssignmentStatus; availableFrom:string|null; dueAt:string|null;
  maxAttempts:number|null; instructions:Record<string,unknown>; createdBy:string; updatedBy:string|null;
  createdAt:string; updatedAt:string;
}
export interface LearningAssignmentItem {
  id:string; organizationId:string; assignmentId:string; itemType:LearningAssignmentItemType;
  contentItemId:string|null; assessmentId:string|null; sequenceNo:number; required:boolean; createdAt:string;
}
export interface LearningAssignmentTarget {
  id:string; tenantId:string; organizationId:string; assignmentId:string; targetType:LearningAssignmentTargetType;
  studentUserId:string|null; classGroupId:string|null; dueAt:string|null; status:LearningAssignmentTargetStatus;
  createdAt:string; updatedAt:string;
}
export interface LearningAssignmentProgress {
  id:string; organizationId:string; assignmentId:string; assignmentTargetId:string; studentUserId:string;
  status:LearningAssignmentProgressStatus; startedAt:string|null; completedAt:string|null;
  lastActivityAt:string|null; createdAt:string; updatedAt:string;
}
export interface LearningAssignmentInput {
  tenantId:string; organizationId:string; classSubjectId?:string|null; code:string; title:string;
  description?:string|null; status?:LearningAssignmentStatus; availableFrom?:string|null; dueAt?:string|null;
  maxAttempts?:number|null; instructions?:Record<string,unknown>; createdBy:string;
}
export interface LearningAssignmentItemInput {
  organizationId:string; assignmentId:string; itemType:LearningAssignmentItemType;
  contentItemId?:string|null; assessmentId?:string|null; sequenceNo:number; required?:boolean;
}
export interface LearningAssignmentTargetInput {
  tenantId:string; organizationId:string; assignmentId:string; targetType:LearningAssignmentTargetType;
  studentUserId?:string|null; classGroupId?:string|null; dueAt?:string|null;
}
export interface LearningAssignmentProgressInput {
  organizationId:string; assignmentId:string; assignmentTargetId:string; studentUserId:string;
}
export type LearningAssignmentJson = Json;