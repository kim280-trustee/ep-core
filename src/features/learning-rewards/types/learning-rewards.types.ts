export type LearningRewardEventType = "assignment_completed" | "assessment_passed";

export type LearningRewardSourceType = "assignment" | "assessment";

export interface LearningRewardLedgerEntry {
  id: string;
  tenantId: string;
  organizationId: string | null;
  studentUserId: string;
  eventType: LearningRewardEventType;
  sourceType: LearningRewardSourceType;
  sourceId: string;
  xpDelta: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}
