import type { Json } from "@/core/database/database.types";

export type LearningSessionContextType = "learning" | "assessment" | "assignment" | "classroom" | "other";
export type LearningActivityType = "content_started" | "content_viewed" | "practice_started" | "practice_completed" | "assessment_started" | "assessment_submitted" | "assignment_started" | "assignment_completed" | "speaking_practice" | "listening_practice" | "writing_practice" | "other";

export interface LearningSession {
  id:string; tenantId:string; organizationId:string|null; studentUserId:string; contextType:LearningSessionContextType;
  contextId:string|null; startedAt:string; endedAt:string|null; metadata:Record<string,unknown>; createdAt:string;
}
export interface LearningActivityEvent {
  id:string; tenantId:string; organizationId:string|null; studentUserId:string; sessionId:string|null;
  activityType:LearningActivityType; contentItemId:string|null; assessmentId:string|null; assignmentId:string|null;
  objectiveId:string|null; metadata:Record<string,unknown>; occurredAt:string;
}
export interface LearningSessionInput {
  tenantId:string; organizationId?:string|null; studentUserId:string; contextType:LearningSessionContextType;
  contextId?:string|null; metadata?:Record<string,unknown>;
}
export interface LearningActivityEventInput {
  tenantId:string; organizationId?:string|null; studentUserId:string; sessionId?:string|null;
  activityType:LearningActivityType; contentItemId?:string|null; assessmentId?:string|null; assignmentId?:string|null;
  objectiveId?:string|null; metadata?:Record<string,unknown>;
}
export type LearningActivityJson = Json;