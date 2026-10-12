import { learningActivityService } from "@/features/learning-activity";
import { learningAssessmentService } from "@/features/learning-assessment";
import type { LearningActivityEvent } from "@/features/learning-activity";
import type { LearningAttempt, LearningAssessmentResult } from "@/features/learning-assessment";
import type { LearningBadge, StudentGamificationSummary } from "../types/learning-gamification.types";

function isValidatedContentCompletion(event: LearningActivityEvent) {
  return event.activityType === "content_viewed"
    && event.metadata["completion"] === "completed"
    && event.metadata["source"] === "validated_completion_rpc"
    && Boolean(event.contentItemId);
}

function buildBadges(completedLessons: number, assessedQuizzes: number, evidenceCount: number): LearningBadge[] {
  return [
    {
      id: "first_steps",
      name: "First Steps",
      description: "Complete your first lesson or assessment.",
      icon: "sparkles",
      earned: evidenceCount >= 1,
      progress: Math.min(evidenceCount, 1),
      goal: 1,
    },
    {
      id: "content_explorer",
      name: "Content Explorer",
      description: "Complete three different lessons.",
      icon: "book",
      earned: completedLessons >= 3,
      progress: Math.min(completedLessons, 3),
      goal: 3,
    },
    {
      id: "assessment_achiever",
      name: "Assessment Achiever",
      description: "Finish three different assessed quizzes.",
      icon: "target",
      earned: assessedQuizzes >= 3,
      progress: Math.min(assessedQuizzes, 3),
      goal: 3,
    },
    {
      id: "learning_champion",
      name: "Learning Champion",
      description: "Build a record of ten completed learning activities.",
      icon: "trophy",
      earned: evidenceCount >= 10,
      progress: Math.min(evidenceCount, 10),
      goal: 10,
    },
  ];
}

export const learningGamificationService = {
  async getStudentSummary(studentUserId: string): Promise<StudentGamificationSummary> {
    const [activityEvents, attempts, results] = await Promise.all([
      learningActivityService.listRecentEvents(studentUserId, 1000),
      learningAssessmentService.listAttempts(studentUserId),
      learningAssessmentService.listResults(studentUserId),
    ]);

    // Only the server-validated completion marker earns lesson XP. Ordinary
    // page views and client-submitted activity events do not award rewards.
    const completedLessons = new Set(
      activityEvents.filter(isValidatedContentCompletion).map((event) => event.contentItemId!),
    ).size;

    const resultAttemptIds = new Set(results.map((result: LearningAssessmentResult) => result.attemptId));
    const assessedQuizzes = new Set(
      attempts
        .filter((attempt: LearningAttempt) => attempt.status === "evaluated" && resultAttemptIds.has(attempt.id))
        .map((attempt: LearningAttempt) => attempt.assessmentId),
    ).size;

    const evidenceCount = completedLessons + assessedQuizzes;
    const xp = completedLessons * 10 + assessedQuizzes * 25;
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXp = xp % 100;

    return {
      xp,
      level,
      currentLevelXp,
      nextLevelXp: 100,
      completedLessons,
      assessedQuizzes,
      evidenceCount,
      badges: buildBadges(completedLessons, assessedQuizzes, evidenceCount),
    };
  },
};
