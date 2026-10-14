export function localLearningDayKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function calculateLearningStreak(timestamps: string[], now = new Date()) {
  const activeDays = new Set(timestamps.map((timestamp) => localLearningDayKey(new Date(timestamp))));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = localLearningDayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localLearningDayKey(yesterday);

  if (!activeDays.has(todayKey) && !activeDays.has(yesterdayKey)) return 0;

  let streak = 0;
  const cursor = activeDays.has(todayKey) ? today : yesterday;
  while (activeDays.has(localLearningDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}


/**
 * Restrict streak and practice-day calculations to evidence that cannot be
 * created by ordinary page views or arbitrary client activity events.
 */
export function getVerifiedLearningActivityTimestamps(
  activityEvents: Array<{ activityType: string; metadata: Record<string, unknown>; occurredAt: string }>,
  rewardEvents: Array<{ eventType: string; occurredAt: string }>,
) {
  const verifiedContentCompletions = activityEvents
    .filter((event) =>
      event.activityType === "content_viewed"
      && event.metadata["completion"] === "completed"
      && event.metadata["source"] === "validated_completion_rpc",
    )
    .map((event) => event.occurredAt);

  const verifiedRewardEvents = rewardEvents
    .filter((event) =>
      event.eventType === "assignment_completed"
      || event.eventType === "assessment_passed"
      || event.eventType === "objective_mastered",
    )
    .map((event) => event.occurredAt);

  return [...verifiedContentCompletions, ...verifiedRewardEvents];
}
