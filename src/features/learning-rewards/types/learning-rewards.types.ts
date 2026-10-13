export type LearningRewardEventType = "assignment_completed" | "assessment_passed" | "objective_mastered" | "weekly_quest_completed";

export type LearningRewardSourceType = "assignment" | "assessment" | "objective" | "weekly_quest";

export interface LearningRewardLedgerEntry {
  id: string;
  tenantId: string;
  organizationId: string | null;
  classGroupId: string | null;
  studentUserId: string;
  eventType: LearningRewardEventType;
  sourceType: LearningRewardSourceType;
  sourceId: string;
  xpDelta: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}
