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
