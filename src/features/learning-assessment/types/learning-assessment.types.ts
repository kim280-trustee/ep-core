import type { Json } from "@/core/database/database.types";

export type LearningQuestionType =
  | "single_choice" | "multiple_choice" | "true_false" | "short_answer"
  | "essay" | "fill_blank" | "matching" | "ordering" | "speaking" | "listening" | "other";
export type LearningQuestionStatus = "draft" | "review" | "published" | "retired";
export type LearningAssessmentType =
  | "diagnostic" | "practice" | "assignment" | "quiz" | "test" | "mock_exam" | "competition" | "other";
export type LearningAssessmentStatus = LearningQuestionStatus;
export type LearningAttemptStatus =
  | "in_progress" | "submitted" | "evaluating" | "evaluated" | "cancelled";
export type LearningEvaluationStatus = "pending" | "auto_evaluated" | "manual_reviewed";

export interface LearningQuestion {
  id: string; organizationId: string | null; code: string; questionType: LearningQuestionType;
  languageCode: string; status: LearningQuestionStatus; createdBy: string; updatedBy: string | null;
  reviewedBy: string | null; reviewedAt: string | null; createdAt: string; updatedAt: string;
}
export interface LearningQuestionVersion {
  id: string; questionId: string; versionNo: number; prompt: Record<string, unknown>;
  configuration: Record<string, unknown>; explanation: Record<string, unknown> | null;
  createdBy: string; reviewedBy: string | null; reviewedAt: string | null; publishedAt: string | null;
  createdAt: string; updatedAt: string;
}
export interface LearningQuestionEvaluationKey {
  questionVersionId: string; evaluationKey: Record<string, unknown>;
  scoringRules: Record<string, unknown>; createdAt: string; updatedAt: string;
}
export interface LearningQuestionObjective {
  questionVersionId: string; objectiveId: string; weight: number; createdAt: string;
}
export interface LearningAssessment {
  id: string; organizationId: string | null; code: string; title: string; description: string | null;
  assessmentType: LearningAssessmentType; languageCode: string; curriculumId: string | null;
  gradeLevelId: string | null; status: LearningAssessmentStatus; createdBy: string; updatedBy: string | null;
  reviewedBy: string | null; reviewedAt: string | null; publishedAt: string | null;
  createdAt: string; updatedAt: string;
}
export interface LearningAssessmentQuestion {
  id: string; assessmentId: string; questionVersionId: string; sequenceNo: number; points: number;
  required: boolean; createdAt: string;
}
export interface LearningAttempt {
  id: string; tenantId: string; organizationId: string | null; assessmentId: string; studentUserId: string;
  attemptNumber: number; previousAttemptId: string | null; status: LearningAttemptStatus;
  startedAt: string; submittedAt: string | null; score: number | null; maxScore: number | null;
  percentage: number | null; createdAt: string; updatedAt: string;
}
export interface LearningAttemptAnswer {
  id: string; attemptId: string; assessmentQuestionId: string; answer: Record<string, unknown>;
  evaluationStatus: LearningEvaluationStatus; isCorrect: boolean | null; awardedPoints: number | null;
  feedback: Record<string, unknown> | null; evaluatedAt: string | null; createdAt: string; updatedAt: string;
}
export interface LearningAssessmentResult {
  id: string; attemptId: string; studentUserId: string; organizationId: string | null;
  score: number | null; maxScore: number | null; percentage: number | null; passed: boolean | null;
  evaluatedAt: string; summary: Record<string, unknown>; createdAt: string; updatedAt: string;
}
export type LearningQuestionInsert = {
  organizationId: string; code: string; questionType: LearningQuestionType; languageCode?: string;
};
export type LearningAssessmentInsert = {
  organizationId: string; code: string; title: string; description?: string | null;
  assessmentType: LearningAssessmentType; languageCode?: string; curriculumId?: string | null;
  gradeLevelId?: string | null;
};
export type LearningAttemptAnswerInput = {
  attemptId: string; assessmentQuestionId: string; answer: Record<string, unknown>;
};
export type LearningJson = Json;
