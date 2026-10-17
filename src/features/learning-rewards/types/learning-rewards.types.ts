export type LearningRewardEventType = "assignment_completed" | "assessment_passed" | "objective_mastered" | "weekly_quest_completed" | "streak_milestone" | "challenge_completed";

export type LearningRewardSourceType = "assignment" | "assessment" | "objective" | "weekly_quest" | "streak_milestone" | "challenge";

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

export type LearningBadgeCode = "first_steps" | "content_explorer" | "assessment_achiever" | "learning_champion";

export interface LearningBadgeAward {
  id: string;
  tenantId: string;
  studentUserId: string;
  badgeCode: LearningBadgeCode;
  title: string;
  description: string;
  ruleVersion: number;
  evidenceCount: number;
  awardedAt: string;
  createdAt: string;
  updatedAt: string;
}
