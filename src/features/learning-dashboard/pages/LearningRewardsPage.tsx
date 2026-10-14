import { useMemo } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Bell, BookOpen, CheckCircle2, Flame, Gift, ShieldCheck, Star, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningActivityService } from "@/features/learning-activity";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "@/features/learning-assessment";
import { learningMasteryService } from "@/features/learning-mastery";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { calculateLearningStreak, LEARNING_REWARD_LEVELS, learningRewardsService } from "@/features/learning-rewards";

function localDayKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function getCurrentWeekStart(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function isWithinCurrentWeek(timestamp: string, weekStart: Date, now = new Date()) {
  const occurredAt = new Date(timestamp);
  return occurredAt >= weekStart && occurredAt <= now;
}


type RewardBadge = {
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon: typeof Award;
};

export default function LearningRewardsPage() {
  const { user } = useAuth();
  const studentId = user?.id ?? "";

  const queryClient = useQueryClient();
  const shopQuery = useQuery({
    queryKey: ["learning", "reward-shop", studentId],
    queryFn: async () => {
      const memberships = await learningEnrollmentService.listUserClasses(studentId);
      const classIds = [...new Set(memberships.filter(item => item.membershipType === "student").map(item => item.classGroupId))];
      const [items, redemptions, notifications, challengesByClass] = await Promise.all([
        learningRewardsService.listShopItems(classIds, true),
        learningRewardsService.listStudentRedemptions(studentId),
        learningRewardsService.listNotifications(studentId),
        Promise.all(classIds.map(classGroupId => learningRewardsService.listClassChallenges(classGroupId))),
      ]);
      return { items, redemptions, notifications, challenges: challengesByClass.flat() };
    },
    enabled: Boolean(studentId),
  });
  const leaderboardQuery = useQuery({
    queryKey: ["learning", "class-leaderboards", studentId],
    queryFn: async () => {
      const memberships = await learningEnrollmentService.listUserClasses(studentId);
      const classIds = [...new Set(memberships.filter(item => item.membershipType === "student").map(item => item.classGroupId))];
      const rows = await Promise.all(classIds.map(classGroupId => learningRewardsService.listClassLeaderboard(classGroupId)));
      return rows.flat();
    },
    enabled: Boolean(studentId),
  });
  const redeemMutation = useMutation({
    mutationFn: (itemId: string) => learningRewardsService.redeemReward(itemId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "reward-shop", studentId] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "rewards", studentId] }),
      ]);
    },
  });
  const readNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => learningRewardsService.markNotificationRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning", "reward-shop", studentId] }),
  });

  const query = useQuery({
    queryKey: ["learning", "rewards", studentId],
    queryFn: async () => {
      const [assignments, progress, attempts, results, mastery, activity, rewardLedger] = await Promise.all([
        learningAssignmentsService.listStudentAssignments(studentId),
        learningAssignmentsService.listProgress(studentId),
        learningAssessmentService.listAttempts(studentId),
        learningAssessmentService.listResults(studentId),
        learningMasteryService.listStudentMastery(studentId),
        learningActivityService.listRecentEvents(studentId, 250),
        learningRewardsService.listStudentLedger(studentId),
      ]);

      return { assignments, progress, attempts, results, mastery, activity, rewardLedger };
    },
    enabled: Boolean(studentId),
  });

  const rewards = useMemo(() => {
    if (!query.data) return null;
    const { assignments, progress, attempts, results, mastery, activity, rewardLedger } = query.data;
    const completedAssignmentIds = new Set(
      progress.filter((item) => item.status === "completed").map((item) => item.assignmentId),
    );
    const passedAssessmentIds = new Set(
      results
        .filter((result) => result.passed === true)
        .map((result) => attempts.find((attempt) => attempt.id === result.attemptId)?.assessmentId)
        .filter((assessmentId): assessmentId is string => Boolean(assessmentId)),
    );
    const masteredObjectives = mastery.filter((item) => item.state === "mastered").length;
    const rewardedAssignmentIds = new Set(rewardLedger.filter((entry) => entry.eventType === "assignment_completed").map((entry) => entry.sourceId));
    const rewardedAssessmentIds = new Set(rewardLedger.filter((entry) => entry.eventType === "assessment_passed").map((entry) => entry.sourceId));
    const rewardedObjectiveIds = new Set(rewardLedger.filter((entry) => entry.eventType === "objective_mastered").map((entry) => entry.sourceId));
    const hasThreeDayStreakMilestone = rewardLedger.some(
      (entry) => entry.eventType === "streak_milestone" && Number(entry.metadata.milestone_days) >= 3,
    );
    const hasSevenDayStreakMilestone = rewardLedger.some(
      (entry) => entry.eventType === "streak_milestone" && Number(entry.metadata.milestone_days) >= 7,
    );
    const hasFourteenDayStreakMilestone = rewardLedger.some(
      (entry) => entry.eventType === "streak_milestone" && Number(entry.metadata.milestone_days) >= 14,
    );
    const hasThirtyDayStreakMilestone = rewardLedger.some(
      (entry) => entry.eventType === "streak_milestone" && Number(entry.metadata.milestone_days) >= 30,
    );
    const xp = rewardLedger.reduce((total, entry) => total + entry.xpDelta, 0);
    const nextLevelIndex = LEARNING_REWARD_LEVELS.findIndex((level) => level.minXp > xp);
    const currentLevel = LEARNING_REWARD_LEVELS[nextLevelIndex === -1 ? LEARNING_REWARD_LEVELS.length - 1 : nextLevelIndex - 1];
    const nextLevel = LEARNING_REWARD_LEVELS[nextLevelIndex] ?? null;
    const levelProgress = nextLevel
      ? Math.min(100, Math.round(((xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100))
      : 100;
    const streak = calculateLearningStreak(activity.map((event) => event.occurredAt));
    const now = new Date();
    const calendarEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()));
    const calendarStart = new Date(calendarEnd);
    calendarStart.setDate(calendarStart.getDate() - 34);
    const activityByDay = new Map<string, number>();
    activity.forEach((event) => {
      const dayKey = localDayKey(new Date(event.occurredAt));
      activityByDay.set(dayKey, (activityByDay.get(dayKey) ?? 0) + 1);
    });
    const activityCalendar = Array.from({ length: 35 }, (_, index) => {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + index);
      const key = localDayKey(date);
      return {
        key,
        date,
        count: activityByDay.get(key) ?? 0,
        isToday: key === localDayKey(now),
      };
    });
    const weekStart = getCurrentWeekStart(now);
    const thisWeeksRewards = rewardLedger.filter((entry) => isWithinCurrentWeek(entry.occurredAt, weekStart, now));
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeeksRewards = rewardLedger.filter((entry) => {
      const occurredAt = new Date(entry.occurredAt);
      return occurredAt >= previousWeekStart && occurredAt < weekStart;
    });
    const xpByDay = new Map<string, number>();
    const xpByWeek = new Map<string, number>();
    rewardLedger.forEach((entry) => {
      const occurredAt = new Date(entry.occurredAt);
      const dayKey = localDayKey(occurredAt);
      xpByDay.set(dayKey, (xpByDay.get(dayKey) ?? 0) + entry.xpDelta);
      const weekStartForEntry = new Date(occurredAt.getFullYear(), occurredAt.getMonth(), occurredAt.getDate());
      weekStartForEntry.setDate(weekStartForEntry.getDate() - ((weekStartForEntry.getDay() + 6) % 7));
      const weekKey = localDayKey(weekStartForEntry);
      xpByWeek.set(weekKey, (xpByWeek.get(weekKey) ?? 0) + entry.xpDelta);
    });
    const todayXp = xpByDay.get(localDayKey(now)) ?? 0;
    const dailyXpGoal = 20;
    const bestXpDay = [...xpByDay.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
    const bestXpWeek = [...xpByWeek.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
    const weeklyXp = thisWeeksRewards.reduce((total, entry) => total + entry.xpDelta, 0);
    const previousWeekXp = previousWeeksRewards.reduce((total, entry) => total + entry.xpDelta, 0);
    const weeklyXpChange = weeklyXp - previousWeekXp;
    const weeklyCompletedAssignments = new Set(
      thisWeeksRewards
        .filter((entry) => entry.eventType === "assignment_completed")
        .map((entry) => entry.sourceId),
    ).size;
    const weeklyPassedAssessments = new Set(
      results
        .filter((result) => result.passed === true && isWithinCurrentWeek(result.evaluatedAt, weekStart, now))
        .map((result) => attempts.find((attempt) => attempt.id === result.attemptId)?.assessmentId)
        .filter((assessmentId): assessmentId is string => Boolean(assessmentId)),
    ).size;
    const weeklyPracticeDays = new Set(
      activity
        .filter((event) => isWithinCurrentWeek(event.occurredAt, weekStart, now))
        .map((event) => localDayKey(new Date(event.occurredAt))),
    ).size;
    const completedWeeklyQuestCodes = new Set(
      thisWeeksRewards
        .filter((entry) => entry.eventType === "weekly_quest_completed")
        .map((entry) => entry.metadata.quest_code)
        .filter((questCode): questCode is string => typeof questCode === "string" && questCode.length > 0),
    );
    const questCodesByWeek = new Map<string, Set<string>>();
    rewardLedger
      .filter((entry) => entry.eventType === "weekly_quest_completed")
      .forEach((entry) => {
        const questCode = entry.metadata.quest_code;
        const weekStartValue = entry.metadata.week_start;
        if (typeof questCode !== "string" || typeof weekStartValue !== "string") return;
        const codes = questCodesByWeek.get(weekStartValue) ?? new Set<string>();
        codes.add(questCode);
        questCodesByWeek.set(weekStartValue, codes);
      });
    const weeklyChampionUnlocked = [...questCodesByWeek.values()].some((codes) => codes.size >= 3);
    const weeklyQuests = [
      {
        title: "Finish two assignments",
        description: "Complete your assigned learning to build momentum.",
        progress: weeklyCompletedAssignments,
        target: 2,
        reward: "+25 XP",
      },
      {
        title: "Pass an assessment",
        description: "Show what you have learned in a quiz or assessment.",
        progress: weeklyPassedAssessments,
        target: 1,
        reward: "+25 XP",
      },
      {
        title: "Learn on three days",
        description: "Short practice sessions count toward your weekly habit.",
        progress: weeklyPracticeDays,
        target: 3,
        reward: "+25 XP",
      },
    ];
    const badges: RewardBadge[] = [
      {
        title: "First Steps",
        description: "Complete your first assignment.",
        unlocked: rewardedAssignmentIds.size >= 1,
        progress: rewardedAssignmentIds.size,
        target: 1,
        icon: BookOpen,
      },
      {
        title: "Assessment Ace",
        description: "Pass an assessment for the first time.",
        unlocked: rewardedAssessmentIds.size >= 1,
        progress: rewardedAssessmentIds.size,
        target: 1,
        icon: Star,
      },
      {
        title: "Three-Day Streak",
        description: "Learn on three consecutive days.",
        unlocked: hasThreeDayStreakMilestone,
        progress: Math.max(streak, hasThreeDayStreakMilestone ? 3 : 0),
        target: 3,
        icon: Flame,
      },
      {
        title: "Mastery Builder",
        description: "Master three learning objectives.",
        unlocked: rewardedObjectiveIds.size >= 3,
        progress: rewardedObjectiveIds.size,
        target: 3,
        icon: ShieldCheck,
      },
      {
        title: "Dedicated Learner",
        description: "Complete five assignments.",
        unlocked: rewardedAssignmentIds.size >= 5,
        progress: rewardedAssignmentIds.size,
        target: 5,
        icon: Trophy,
      },
      {
        title: "Weekly Champion",
        description: "Complete all three weekly quests in one week.",
        unlocked: weeklyChampionUnlocked,
        progress: Math.max(completedWeeklyQuestCodes.size, weeklyChampionUnlocked ? 3 : 0),
        target: 3,
        icon: Trophy,
      },
      {
        title: "Rising Star",
        description: "Complete ten assignments.",
        unlocked: rewardedAssignmentIds.size >= 10,
        progress: rewardedAssignmentIds.size,
        target: 10,
        icon: BookOpen,
      },
      {
        title: "Quiz Champion",
        description: "Pass five distinct assessments.",
        unlocked: rewardedAssessmentIds.size >= 5,
        progress: rewardedAssessmentIds.size,
        target: 5,
        icon: Star,
      },
      {
        title: "Mastery Expert",
        description: "Master ten learning objectives.",
        unlocked: rewardedObjectiveIds.size >= 10,
        progress: rewardedObjectiveIds.size,
        target: 10,
        icon: ShieldCheck,
      },
      {
        title: "Week Warrior",
        description: "Learn on seven consecutive days.",
        unlocked: hasSevenDayStreakMilestone,
        progress: Math.max(streak, hasSevenDayStreakMilestone ? 7 : 0),
        target: 7,
        icon: Flame,
      },
      {
        title: "Fortnight Focus",
        description: "Learn on fourteen consecutive days.",
        unlocked: hasFourteenDayStreakMilestone,
        progress: Math.max(streak, hasFourteenDayStreakMilestone ? 14 : 0),
        target: 14,
        icon: Flame,
      },
      {
        title: "Monthly Master",
        description: "Learn on thirty consecutive days.",
        unlocked: hasThirtyDayStreakMilestone,
        progress: Math.max(streak, hasThirtyDayStreakMilestone ? 30 : 0),
        target: 30,
        icon: Flame,
      },
    ];
    return {
      xp,
      currentLevel,
      nextLevel,
      levelProgress,
      streak,
      weeklyXp,
      todayXp,
      dailyXpGoal,
      bestXpDay,
      bestXpWeek,
      previousWeekXp,
      weeklyXpChange,
      activityCalendar,
      weeklyQuests,
      completedCount: completedAssignmentIds.size,
      passedCount: passedAssessmentIds.size,
      masteredObjectives,
      badges,
      availableAssignments: assignments.length,
      unlockedCount: badges.filter((badge) => badge.unlocked).length,
      recentActivityCount: activity.length,
      rewardEventCount: rewardLedger.length,
      recentRewards: rewardLedger.slice(0, 5),
    };
  }, [query.data]);

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view your rewards.</div>;
  }

  if (query.isPending) {
    return <div className="space-y-4"><div className="h-36 animate-pulse rounded-2xl bg-slate-200" /><div className="h-56 animate-pulse rounded-2xl bg-slate-200" /></div>;
  }

  if (query.isError || !rewards) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p className="font-semibold">Your rewards could not be loaded.</p>
        <p className="mt-1 text-sm">Your learning records have not been changed.</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-slate-500">Student Learning</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Rewards & achievements</h1>
        <p className="mt-2 text-sm text-slate-500">Earn XP for completing assignments, passing assessments, and mastering learning objectives.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Zap size={20} />} label="Learning XP" value={String(rewards.xp)} detail="Earned from recorded learning evidence" />
        <Metric icon={<Star size={20} />} label="XP this week" value={String(rewards.weeklyXp)} detail={`${rewards.weeklyXpChange >= 0 ? "+" : ""}${rewards.weeklyXpChange} XP compared with last week`} />
        <Metric icon={<Flame size={20} />} label="Learning streak" value={`${rewards.streak} ${rewards.streak === 1 ? "day" : "days"}`} detail="Consecutive days with recorded activity" />
        <Metric icon={<Trophy size={20} />} label="Badges unlocked" value={`${rewards.unlockedCount} / ${rewards.badges.length}`} detail="Achievements earned so far" />
      </section>

      <section aria-labelledby="daily-goal-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="daily-goal-heading" className="text-lg font-semibold text-slate-900">Today's learning goal</h2>
            <p className="mt-1 text-sm text-slate-500">Aim to earn 20 XP from verified learning today. Completing an assignment earns 20 XP.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rewards.todayXp >= rewards.dailyXpGoal ? "bg-emerald-100 text-emerald-800" : "bg-indigo-50 text-indigo-700"}`}>
            {rewards.todayXp >= rewards.dailyXpGoal ? "Goal reached" : "Daily target"}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Daily XP goal progress" aria-valuemin={0} aria-valuemax={rewards.dailyXpGoal} aria-valuenow={Math.min(rewards.todayXp, rewards.dailyXpGoal)}>
          <div className={`h-full rounded-full transition-[width] ${rewards.todayXp >= rewards.dailyXpGoal ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(100, Math.round((rewards.todayXp / rewards.dailyXpGoal) * 100))}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <span>{rewards.todayXp} / {rewards.dailyXpGoal} XP earned today</span>
          <span>{rewards.todayXp >= rewards.dailyXpGoal ? "Keep your learning streak going." : `${rewards.dailyXpGoal - rewards.todayXp} XP to go`}</span>
        </div>
      </section>

      <section aria-labelledby="personal-bests-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <h2 id="personal-bests-heading" className="text-lg font-semibold text-slate-900">Your personal bests</h2>
          <p className="mt-1 text-sm text-slate-500">Your strongest XP days and weeks, based on your recorded reward history.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Best XP day</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{rewards.bestXpDay ? `+${rewards.bestXpDay[1]} XP` : "0 XP"}</p>
            <p className="mt-1 text-sm text-slate-600">{rewards.bestXpDay ? new Date(`${rewards.bestXpDay[0]}T12:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Earn XP to set your first record."}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-4">
            <p className="text-sm font-medium text-indigo-900">Best XP week</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{rewards.bestXpWeek ? `+${rewards.bestXpWeek[1]} XP` : "0 XP"}</p>
            <p className="mt-1 text-sm text-slate-600">{rewards.bestXpWeek ? `Week starting ${new Date(`${rewards.bestXpWeek[0]}T12:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}` : "Your weekly record will appear here."}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="learning-activity-calendar-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="learning-activity-calendar-heading" className="text-lg font-semibold text-slate-900">Your learning activity</h2>
            <p className="mt-1 text-sm text-slate-500">A five-week view of recorded learning activity. Keep showing up in small, steady steps.</p>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">{rewards.streak}-day current streak</span>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2" role="group" aria-label="Learning activity calendar for the last five weeks">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className="text-center text-xs font-medium text-slate-500">{day}</span>
          ))}
          {rewards.activityCalendar.map((day) => {
            const intensity = day.count === 0 ? "bg-slate-100" : day.count === 1 ? "bg-emerald-200" : day.count <= 3 ? "bg-emerald-400" : "bg-emerald-700";
            return (
              <div
                key={day.key}
                title={`${day.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}: ${day.count} recorded ${day.count === 1 ? "activity" : "activities"}`}
                aria-label={`${day.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}: ${day.count} recorded ${day.count === 1 ? "activity" : "activities"}`}
                className={`flex aspect-square min-h-8 items-center justify-center rounded-lg border text-xs ${intensity} ${day.isToday ? "border-slate-900 ring-2 ring-slate-300" : "border-transparent"} ${day.count > 0 && day.count <= 3 ? "text-emerald-950" : day.count > 3 ? "text-white" : "text-slate-500"}`}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Each square shows the number of recorded learning events for that day.</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Activity intensity legend">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-slate-100" />
            <span className="h-3 w-3 rounded-sm bg-emerald-200" />
            <span className="h-3 w-3 rounded-sm bg-emerald-400" />
            <span className="h-3 w-3 rounded-sm bg-emerald-700" />
            <span>More</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="learning-level-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Your current level</p>
            <h2 id="learning-level-heading" className="mt-1 text-xl font-bold text-slate-900">{rewards.currentLevel.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{rewards.currentLevel.description}</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900">{rewards.xp} XP</span>
        </div>
        {rewards.nextLevel ? (
          <div className="mt-5">
            <div
              role="progressbar"
              aria-label={`Progress to ${rewards.nextLevel.name} level`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={rewards.levelProgress}
              className="h-3 overflow-hidden rounded-full bg-slate-100"
            >
              <div className="h-full rounded-full bg-amber-500 transition-[width]" style={{ width: `${rewards.levelProgress}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-slate-600">
              <span>{rewards.levelProgress}% to next level</span>
              <span>{rewards.nextLevel.minXp - rewards.xp} XP to {rewards.nextLevel.name}</span>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm font-medium text-slate-700">You have reached the highest level currently available.</p>
        )}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold text-slate-800">Your level journey</h3>
          <p className="mt-1 text-xs text-slate-500">Every level has a clear XP milestone to work toward.</p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_REWARD_LEVELS.map((level) => {
              const reached = rewards.xp >= level.minXp;
              const current = rewards.currentLevel.name === level.name;
              return (
                <li key={level.name} className={`rounded-xl border p-3 ${current ? "border-amber-300 bg-amber-50" : reached ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{level.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${current ? "bg-amber-100 text-amber-900" : reached ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-500"}`}>
                      {current ? "Current" : reached ? "Reached" : "Locked"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{level.minXp.toLocaleString()} XP required</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="weekly-quests-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="weekly-quests-heading" className="text-lg font-semibold text-slate-900">This week's quests</h2>
            <p className="mt-1 text-sm text-slate-500">Small goals to keep learning moving. Progress resets at the start of each week.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Weekly challenge</span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {rewards.weeklyQuests.map((quest) => {
            const progress = Math.min(quest.progress, quest.target);
            const percent = Math.round((progress / quest.target) * 100);
            const complete = progress >= quest.target;
            return (
              <article key={quest.title} className={`rounded-xl border p-4 ${complete ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{quest.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${complete ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600"}`}>
                    {complete ? "Complete" : "In progress"}
                  </span>
                </div>
                <p className="mt-2 min-h-10 text-sm text-slate-600">{quest.description}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full transition-[width] ${complete ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{progress} / {quest.target}</span>
                  <span>{quest.reward}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-amber-50 p-3 text-amber-700"><Award size={22} /></span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your achievement collection</h2>
            <p className="text-sm text-slate-500">Badges unlock automatically when the underlying learning evidence meets the goal.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {rewards.badges.map((badge) => {
            const Icon = badge.icon;
            const progress = Math.min(badge.progress, badge.target);
            const progressPercent = Math.round((progress / badge.target) * 100);
            return (
              <article key={badge.title} className={`flex items-start gap-3 rounded-xl border p-4 ${badge.unlocked ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-slate-50"}`}>
                <span className={`rounded-xl p-2 ${badge.unlocked ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-500"}`}><Icon size={21} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{badge.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.unlocked ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>{badge.unlocked ? "Unlocked" : "Locked"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`${badge.title} progress`} aria-valuemin={0} aria-valuemax={badge.target} aria-valuenow={progress}>
                    <div className={`h-full rounded-full ${badge.unlocked ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{badge.unlocked ? "Goal completed" : `${progress} of ${badge.target} toward this badge`}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="reward-notifications-heading" className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Bell size={20} className="text-indigo-700"/><h2 id="reward-notifications-heading" className="text-lg font-semibold text-slate-900">Reward celebrations</h2></div>
        <p className="mt-1 text-sm text-slate-600">These in-app notifications are created when the protected XP ledger awards a reward.</p>
        {shopQuery.isPending ? <p className="mt-3 text-sm text-slate-500">Loading notifications…</p> : shopQuery.isError ? <p className="mt-3 text-sm text-red-700">Notifications could not be loaded.</p> : !(shopQuery.data?.notifications ?? []).some(item => !item.read_at) ? <p className="mt-3 text-sm text-slate-500">You're all caught up. New XP rewards will appear here.</p> : <ul className="mt-3 space-y-2">{(shopQuery.data?.notifications ?? []).filter(item => !item.read_at).slice(0,5).map(item => <li key={item.id} className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-white p-3"><span className="rounded-lg bg-indigo-100 p-2 text-indigo-700"><Award size={17}/></span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.message}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div><button type="button" onClick={() => readNotificationMutation.mutate(item.id)} disabled={readNotificationMutation.isPending} aria-label={"Mark notification read: " + item.title} className="shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50">Read</button></li>)}</ul>}
      </section>

      <section aria-labelledby="class-challenges-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2"><Trophy size={20} className="text-indigo-700"/><h2 id="class-challenges-heading" className="text-lg font-semibold text-slate-900">Class challenges</h2></div>
        <p className="mt-1 text-sm text-slate-500">Shared goals set by your teacher. Meet the target during the challenge period to earn the bonus XP.</p>
        {shopQuery.isPending ? <p className="mt-3 text-sm text-slate-500">Loading challenges…</p> : shopQuery.isError ? <p className="mt-3 text-sm text-red-700">Challenges could not be loaded.</p> : (() => {
          const now = new Date().getTime();
          const activeChallenges = (shopQuery.data?.challenges ?? []).filter(challenge =>
            challenge.status === "active"
            && new Date(challenge.starts_at).getTime() <= now
            && new Date(challenge.ends_at).getTime() >= now
          );
          return activeChallenges.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{activeChallenges.map(challenge => {
            const matchingRewards = query.data?.rewardLedger.filter(entry => entry.eventType === "challenge_completed" && entry.sourceId === challenge.id) ?? [];
            const completed = matchingRewards.length > 0;
            const evidence = (query.data?.rewardLedger ?? []).filter(entry => entry.classGroupId === challenge.class_group_id && entry.organizationId === challenge.organization_id && entry.occurredAt >= challenge.starts_at && entry.occurredAt <= challenge.ends_at);
            const progress = challenge.target_type === "assignments_completed" ? new Set(evidence.filter(entry => entry.eventType === "assignment_completed").map(entry => entry.sourceId)).size : evidence.filter(entry => entry.eventType !== "challenge_completed").reduce((sum, entry) => sum + entry.xpDelta, 0);
            const bounded = Math.min(progress, challenge.target_value);
            const percent = Math.round((bounded / challenge.target_value) * 100);
            return <article key={challenge.id} className={"rounded-xl border p-4 " + (completed ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50")}><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-slate-900">{challenge.title}</h3><span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-semibold text-indigo-700">+{challenge.bonus_xp} XP</span></div><p className="mt-2 text-sm text-slate-600">{challenge.description || (challenge.target_value + " " + challenge.target_type.replaceAll("_"," "))}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={challenge.title + " progress"} aria-valuemin={0} aria-valuemax={challenge.target_value} aria-valuenow={bounded}><div className={"h-full rounded-full " + (completed ? "bg-emerald-500" : "bg-indigo-500")} style={{width:percent+"%"}}/></div><div className="mt-2 flex justify-between gap-2 text-xs text-slate-500"><span>{completed ? "Completed" : bounded + " / " + challenge.target_value}</span><span>Ends {new Date(challenge.ends_at).toLocaleDateString()}</span></div></article>;
          })}</div> : <p className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">No active class challenges right now.</p>;
        })()}
      </section>

      <section aria-labelledby="class-leaderboard-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2"><Trophy size={20} className="text-indigo-700"/><h2 id="class-leaderboard-heading" className="text-lg font-semibold text-slate-900">Class XP standings</h2></div>
        <p className="mt-1 text-sm text-slate-500">See how your learning XP compares with classmates. Names are shortened to protect student privacy.</p>
        <p className="mt-2 text-xs text-slate-500">Class standings count XP earned from learning linked to this class. Your overall XP also includes organization-wide rewards, such as assessment passes and mastered objectives.</p>
        {leaderboardQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading class standings…</p> : leaderboardQuery.isError ? <p className="mt-4 text-sm text-red-700">Class standings could not be loaded.</p> : (() => {
          const allRows = leaderboardQuery.data ?? [];
          const classIds = [...new Set(allRows.map(row => row.class_group_id))];
          return classIds.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{classIds.map(classId => {
            const rows = allRows.filter(row => row.class_group_id === classId);
            const visible = rows.slice(0, 5);
            const own = rows.find(row => row.is_current_user);
            if (own && !visible.some(row => row.is_current_user)) visible.push(own);
            return <section key={classId} className="rounded-xl border border-slate-200 p-4" aria-label={rows[0]?.class_name + " XP standings"}>
              <h3 className="font-semibold text-slate-900">{rows[0]?.class_name ?? "Your class"}</h3>
              <ol className="mt-3 space-y-2">
                {visible.map((row, index) => <li key={row.rank + "-" + index} className={"flex items-center gap-3 rounded-lg px-3 py-2 " + (row.is_current_user ? "bg-indigo-50 ring-1 ring-indigo-200" : "bg-slate-50")}>
                  <span className="w-7 text-sm font-bold tabular-nums text-slate-500">#{row.rank}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{row.display_name}{row.is_current_user ? " (you)" : ""}</span>
                  <span className="text-sm font-semibold tabular-nums text-indigo-700">{row.xp_total} XP</span>
                </li>)}
              </ol>
            </section>;
          })}</div> : <p className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">Class standings will appear when you join a class and earn learning XP.</p>;
        })()}
      </section>

      <section aria-labelledby="reward-shop-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2"><Gift size={20}/><h2 id="reward-shop-heading" className="text-lg font-semibold text-slate-900">Class reward shop</h2></div>
        <p className="mt-1 text-sm text-slate-500">Spend XP earned in your school organization on rewards offered by your class. Requests reserve stock and XP until the teacher reviews them.</p>
        {redeemMutation.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{redeemMutation.error instanceof Error ? redeemMutation.error.message : "Reward request failed."}</p>}
        {shopQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading class rewards…</p> : shopQuery.isError ? <p className="mt-4 text-sm text-red-700">The reward shop could not be loaded.</p> : !(shopQuery.data?.items ?? []).some(item => item.status === "active") ? <p className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">Your teacher has not added rewards to your classes yet.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shopQuery.data.items.filter(item => item.status === "active").map(item => {
          const classXp = query.data?.rewardLedger.filter(entry => entry.organizationId === item.organization_id).reduce((sum, entry) => sum + entry.xpDelta, 0) ?? 0;
          const committed = shopQuery.data?.redemptions.filter(entry => entry.organization_id === item.organization_id && entry.status !== "rejected").reduce((sum, entry) => sum + entry.cost_xp, 0) ?? 0;
          const balance = Math.max(0, classXp - committed);
          const stockAvailable = item.quantity_remaining === null || item.quantity_remaining > 0;
          return <article key={item.id} className="flex flex-col rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-slate-900">{item.name}</h3><span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">{item.cost_xp} XP</span></div><p className="mt-2 flex-1 text-sm text-slate-600">{item.description || "A reward offered by your teacher."}</p><p className="mt-3 text-xs text-slate-500">Your school balance: {balance} XP {item.quantity_remaining !== null ? "· " + item.quantity_remaining + " left" : ""}</p><button type="button" onClick={() => redeemMutation.mutate(item.id)} disabled={redeemMutation.isPending || balance < item.cost_xp || !stockAvailable} className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{!stockAvailable ? "Out of stock" : balance < item.cost_xp ? "Keep earning XP" : "Request reward"}</button></article>;
        })}</div>}
        {(shopQuery.data?.redemptions ?? []).length > 0 && <div className="mt-5 border-t pt-4"><h3 className="font-semibold text-slate-900">Your reward requests</h3><ul className="mt-2 divide-y">{shopQuery.data?.redemptions.slice(0,6).map(entry => { const item = shopQuery.data?.items.find(candidate => candidate.id === entry.item_id); return <li key={entry.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span>{item?.name ?? "Reward"} · {entry.cost_xp} XP</span><span className={"rounded-full px-2 py-1 text-xs font-semibold capitalize " + (entry.status === "fulfilled" ? "bg-emerald-50 text-emerald-700" : entry.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800")}>{entry.status}</span></li>; })}</ul></div>}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 size={15}/> XP is deducted by a secure database transaction, not by the browser.</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">How XP is earned</h2>
        <div className="mt-4 divide-y divide-slate-100">
          <RewardRule title="Assignment completed" points="+20 XP" detail="Counted once per completed assignment." />
          <RewardRule title="Assessment passed" points="+15 XP" detail="Counted once per distinct assessment passed." />
          <RewardRule title="Objective mastered" points="+10 XP" detail="Awarded once when an objective first reaches verified mastered status." />
          <RewardRule title="Weekly quest completed" points="+25 XP" detail="Earned once for each weekly quest completed." />
          <RewardRule title="Three-day streak" points="+20 XP" detail="One-time bonus for learning on three consecutive days." />
          <RewardRule title="Seven-day streak" points="+50 XP" detail="One-time bonus for learning on seven consecutive days." />
          <RewardRule title="Class challenge completed" points="5–100 XP" detail="Bonus XP when you meet a teacher-created class goal." />
        </div>
        <p className="mt-4 text-xs text-slate-500">XP is recorded in a protected reward ledger. Badge progress reflects your recorded learning evidence.</p>
      </section>

      <section aria-labelledby="recent-xp-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="recent-xp-heading" className="text-lg font-semibold text-slate-900">Recent XP activity</h2>
            <p className="mt-1 text-sm text-slate-500">A record of the learning evidence that earned your XP.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{rewards.rewardEventCount} total events</span>
        </div>
        {rewards.recentRewards.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {rewards.recentRewards.map((entry) => {
              const assignment = entry.eventType === "assignment_completed";
              const mastery = entry.eventType === "objective_mastered";
              const weeklyQuest = entry.eventType === "weekly_quest_completed";
              const streakMilestone = entry.eventType === "streak_milestone";
              const challenge = entry.eventType === "challenge_completed";
              return (
                <li key={entry.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={`rounded-xl p-2 ${assignment ? "bg-sky-50 text-sky-700" : mastery ? "bg-emerald-50 text-emerald-700" : weeklyQuest ? "bg-violet-50 text-violet-700" : streakMilestone ? "bg-rose-50 text-rose-700" : challenge ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                    {assignment ? <BookOpen size={18} aria-hidden="true" /> : mastery ? <ShieldCheck size={18} aria-hidden="true" /> : weeklyQuest ? <Award size={18} aria-hidden="true" /> : streakMilestone ? <Flame size={18} aria-hidden="true" /> : challenge ? <Trophy size={18} aria-hidden="true" /> : <Star size={18} aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{assignment ? "Assignment completed" : mastery ? "Objective mastered" : weeklyQuest ? "Weekly quest completed" : streakMilestone ? `${Number(entry.metadata.milestone_days) || 0}-day streak milestone` : challenge ? "Class challenge completed" : "Assessment passed"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(entry.occurredAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-emerald-700">+{entry.xpDelta} XP</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Your XP activity appears here after assignments, passed assessments, mastered objectives, and completed weekly quests.</p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <SummaryCard label="Assignments completed" value={String(rewards.completedCount)} detail={`of ${rewards.availableAssignments} currently available assignments`} />
        <SummaryCard label="Assessments passed" value={String(rewards.passedCount)} detail="Distinct assessments passed" />
        <SummaryCard label="Objectives mastered" value={String(rewards.masteredObjectives)} detail="From your current mastery records" />
        <SummaryCard label="Recent learning events" value={String(rewards.recentActivityCount)} detail="Most recent recorded events loaded" />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/learning/progress" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">View learning progress</Link>
        <Link to="/learning/assignments" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Continue learning</Link>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

function RewardRule({ title, points, detail }: { title: string; points: string; detail: string }) {
  return <div className="flex items-start justify-between gap-4 py-3 first:pt-0"><div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{points}</span></div>;
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}
