export type LearningMasteryState = "not_started" | "developing" | "proficient" | "mastered" | "needs_review";
export type LearningRecommendationType = "learn" | "practice" | "review" | "retest" | "assessment" | "intervention";
export type LearningRecommendationStatus = "active" | "completed" | "dismissed" | "expired";

export interface LearningStudentMastery {
  id: string; tenantId: string; organizationId: string | null; studentUserId: string; objectiveId: string;
  masteryScore: number; confidenceScore: number; state: LearningMasteryState; attemptsCount: number;
  correctCount: number; lastAssessedAt: string | null; nextReviewAt: string | null;
  createdAt: string; updatedAt: string;
}
export interface LearningMasteryEvent {
  id: string; tenantId: string; organizationId: string | null; studentUserId: string; objectiveId: string;
  attemptId: string | null; previousScore: number | null; newScore: number;
  evidence: Record<string, unknown>; createdAt: string;
}
export interface LearningRecommendation {
  id: string; tenantId: string; organizationId: string | null; studentUserId: string;
  recommendationType: LearningRecommendationType; objectiveId: string | null; contentItemId: string | null;
  assessmentId: string | null; priority: number; reason: Record<string, unknown>;
  status: LearningRecommendationStatus; generatedAt: string; expiresAt: string | null;
  completedAt: string | null; createdAt: string; updatedAt: string;
}
