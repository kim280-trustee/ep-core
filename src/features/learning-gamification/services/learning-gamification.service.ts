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

function localDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCurrentStreakDays(activeDays: Set<string>, now = new Date()) {
  const today = localDateKey(now);
  if (!today) return 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!activeDays.has(today)) cursor.setDate(cursor.getDate() - 1);
  const firstCandidate = localDateKey(cursor);
  if (!firstCandidate || !activeDays.has(firstCandidate)) return 0;

  let streak = 0;
  while (true) {
    const key = localDateKey(cursor);
    if (!key || !activeDays.has(key)) return streak;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
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
      learningActivityService.listValidatedContentCompletions(studentUserId),
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
    const now = new Date();
    const todayKey = localDateKey(now);
    const validatedCompletionDates = activityEvents
      .filter(isValidatedContentCompletion)
      .filter((event) => event.contentItemId && event.occurredAt)
      .map((event) => ({ itemId: event.contentItemId!, day: localDateKey(event.occurredAt) }))
      .filter((entry): entry is { itemId: string; day: string } => Boolean(entry.day));
    const resultByAttempt = new Map(results.map((result: LearningAssessmentResult) => [result.attemptId, result]));
    const evaluatedAttempts = attempts.filter((attempt: LearningAttempt) => attempt.status === "evaluated" && resultByAttempt.has(attempt.id));
    const activeDays = new Set<string>([
      ...validatedCompletionDates.map((entry) => entry.day),
      ...evaluatedAttempts.map((attempt) => localDateKey(resultByAttempt.get(attempt.id)!.evaluatedAt)).filter((day): day is string => Boolean(day)),
    ]);
    const todayLessonIds = new Set(validatedCompletionDates.filter((entry) => entry.day === todayKey).map((entry) => entry.itemId));
    const todayAssessmentIds = new Set(evaluatedAttempts.filter((attempt) => localDateKey(resultByAttempt.get(attempt.id)!.evaluatedAt) === todayKey).map((attempt) => attempt.id));
    const todayActivities = todayLessonIds.size + todayAssessmentIds.size;
    const currentStreakDays = getCurrentStreakDays(activeDays, now);
    const dailyGoalActivities = 3;
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
      currentStreakDays,
      todayActivities,
      dailyGoalActivities,
      badges: buildBadges(completedLessons, assessedQuizzes, evidenceCount),
    };
  },
};
