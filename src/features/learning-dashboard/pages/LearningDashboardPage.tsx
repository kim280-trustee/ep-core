import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, BookOpen, CheckCircle2, Clock3, Flame, Target, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningRuntimeService } from "@/features/learning-runtime";
import { learningActivityService } from "@/features/learning-activity";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { calculateLearningStreak, getVerifiedLearningActivityTimestamps, LEARNING_REWARD_LEVELS, learningRewardsService } from "@/features/learning-rewards";
import type { LearningAssignmentProgress } from "@/features/learning-assignments";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function activityLabel(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LearningDashboardPage() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);
  const { user } = useAuth();
  const studentUserId = user?.id ?? "";

  const query = useQuery({
    queryKey: ["learning", "student-overview", studentUserId],
    queryFn: async () => {
      const overview = await learningRuntimeService.getStudentOverview(studentUserId);

      const recommendations = await Promise.all(
        overview.recommendations.map(async (item) => {
          if (!item.assessmentId) return { ...item, assignmentId: null };

          const assignment =
            await learningAssignmentsService.findStudentAssignmentForAssessment(
              item.assessmentId,
              studentUserId,
            );

          return {
            ...item,
            assignmentId: assignment?.id ?? null,
          };
        }),
      );

      return {
        ...overview,
        recommendations: recommendations.filter(
          (item) => !item.assessmentId || Boolean(item.assignmentId),
        ),
      };
    },
    enabled: Boolean(studentUserId),
  });

  // Rewards load independently so a reward-ledger issue never blocks the core learning dashboard.
  const rewardsQuery = useQuery({
    queryKey: ["learning", "dashboard-reward-ledger", studentUserId],
    queryFn: () => learningRewardsService.listStudentLedger(studentUserId),
    enabled: Boolean(studentUserId),
  });

  const activityQuery = useQuery({
    queryKey: ["learning", "dashboard-reward-activity", studentUserId],
    queryFn: () => learningActivityService.listRecentEvents(studentUserId, 250),
    enabled: Boolean(studentUserId),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view your learning dashboard.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-2"><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /></div></div>;
  if (query.isError) return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={20} /><div><p className="font-semibold">We could not load your learning dashboard.</p><p className="mt-1 text-sm">Please try again. Your learning data has not been changed.</p><button type="button" onClick={() => void query.refetch()} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;

  const overview = query.data;
  const rewardXp = (rewardsQuery.data ?? []).reduce((total, entry) => total + entry.xpDelta, 0);
  const learningStreak = activityQuery.isSuccess && rewardsQuery.isSuccess
    ? calculateLearningStreak(getVerifiedLearningActivityTimestamps(activityQuery.data, rewardsQuery.data))
    : null;
  const currentRewardLevel = [...LEARNING_REWARD_LEVELS].reverse().find((level) => rewardXp >= level.minXp) ?? LEARNING_REWARD_LEVELS[0];
  const nextRewardLevel = LEARNING_REWARD_LEVELS.find((level) => level.minXp > rewardXp);
  const rewardLevelProgress = nextRewardLevel
    ? Math.min(100, Math.round(((rewardXp - currentRewardLevel.minXp) / (nextRewardLevel.minXp - currentRewardLevel.minXp)) * 100))
    : 100;
  const inProgress = overview.progress.filter((p) => p.status === "in_progress");
  const completed = overview.progress.filter((p) => p.status === "completed");
  const averageMastery = overview.mastery.length ? Math.round(overview.mastery.reduce((sum, item) => sum + item.masteryScore, 0) / overview.mastery.length) : 0;
  const assignmentsById = new Map(overview.assignments.map((a) => [a.id, a]));
  const continueItems = inProgress.map((p) => ({ progress: p, assignment: assignmentsById.get(p.assignmentId) })).filter((x): x is { progress: LearningAssignmentProgress; assignment: NonNullable<typeof x.assignment> } => Boolean(x.assignment)).slice(0, 4);
  const dueAssignments = overview.assignments.filter((a) => a.status === "published").slice(0, 5);
  const completedAssignmentIds = new Set(completed.map((item) => item.assignmentId));
  const reminderCutoff = now === null ? 0 : now + 7 * 24 * 60 * 60 * 1000;
  const dueAlerts = now === null ? [] : overview.assignments
    .filter((assignment) =>
      assignment.status === "published" &&
      Boolean(assignment.dueAt) &&
      !completedAssignmentIds.has(assignment.id) &&
      new Date(assignment.dueAt!).getTime() <= reminderCutoff
    )
    .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
    .slice(0, 5);

  return <div className="space-y-6">
    <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-slate-300">Student Learning</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Welcome back, {user.name || "Student"}</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Continue your learning, review your progress, and see what should come next.</p></div>{continueItems.length > 0 && <Link to={`/learning/assignments/${continueItems[0].assignment.id}`} className="inline-flex w-fit items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">Continue learning</Link>}</div></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat icon={<Target size={19} />} label="Mastery" value={averageMastery + "%"} detail={overview.mastery.length + " objectives"} />
      <Stat icon={<BookOpen size={19} />} label="Assignments" value={String(overview.assignments.length)} detail={inProgress.length + " in progress"} />
      <Stat icon={<CheckCircle2 size={19} />} label="Completed" value={String(completed.length)} detail="assignment progress" />
      <Stat icon={<TrendingUp size={19} />} label="Recommendations" value={String(overview.recommendations.length)} detail="ready for you" />
    </section>
    {rewardsQuery.isSuccess && <section aria-labelledby="dashboard-rewards-heading" className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-amber-100 p-3 text-amber-800"><Zap size={22} aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-medium text-amber-800">Your learning rewards</p>
            <h2 id="dashboard-rewards-heading" className="mt-0.5 text-xl font-bold text-slate-900">{currentRewardLevel.name} · {rewardXp} XP</h2>
            <p className="mt-1 text-sm text-slate-600">{currentRewardLevel.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {learningStreak !== null && <div className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800" aria-label={`Current learning streak: ${learningStreak} days`}>
            <Flame size={18} aria-hidden="true" />
            <span>{learningStreak} {learningStreak === 1 ? "day" : "days"} streak</span>
          </div>}
          <Link to="/learning/rewards" className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">View rewards</Link>
        </div>
      </div>
      {nextRewardLevel ? <div className="mt-5">
        <div role="progressbar" aria-label={`Progress to ${nextRewardLevel.name} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={rewardLevelProgress} className="h-2.5 overflow-hidden rounded-full bg-amber-100">
          <div className="h-full rounded-full bg-amber-500 transition-[width]" style={{ width: `${rewardLevelProgress}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
          <span>{rewardLevelProgress}% to next level</span>
          <span>{nextRewardLevel.minXp - rewardXp} XP to {nextRewardLevel.name}</span>
        </div>
      </div> : <p className="mt-4 text-sm font-medium text-slate-700">Highest current level reached.</p>}
    </section>}
    {dueAlerts.length > 0 && <DashboardCard title="Assignment reminders" icon={<AlertCircle size={20} />}>
      <div className="space-y-3">{dueAlerts.map((assignment) => {
        const overdue = now !== null && new Date(assignment.dueAt!).getTime() < now;
        return <Link key={assignment.id} to={`/learning/assignments/${assignment.id}`} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
          <div><p className="font-medium text-slate-900">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">Due {formatDate(assignment.dueAt)}</p></div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${overdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{overdue ? "Overdue" : "Due within 7 days"}</span>
        </Link>;
      })}</div>
    </DashboardCard>}
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardCard title="Continue Learning" icon={<BookOpen size={20} />}>{continueItems.length ? <div className="divide-y divide-slate-100">{continueItems.map(({ assignment, progress }) => <Link key={progress.id} to={`/learning/assignments/${assignment.id}`} className="block rounded-xl py-4 first:pt-0 last:pb-0 hover:bg-slate-50"><div className="flex items-start justify-between gap-4 px-2"><div><h3 className="font-semibold text-slate-900">{assignment.title}</h3><p className="mt-1 text-sm text-slate-500">{assignment.description || "Continue this assignment."}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">In progress</span></div></Link>)}</div> : <EmptyState text="You have no learning activities in progress yet." />}</DashboardCard>
      <DashboardCard title="Recommended for You" icon={<Target size={20} />}>{overview.recommendations.length ? <div className="space-y-3">{overview.recommendations.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><span className="font-medium capitalize text-slate-900">{item.recommendationType}</span><span className="text-xs text-slate-500">Priority {item.priority}</span></div><p className="mt-1 text-sm text-slate-500">{item.objectiveId ? "Learning objective: " + item.objectiveId : "A learning activity selected for you."}</p>
{item.assessmentId && item.assignmentId && (
  <Link
    to={`/learning/assignments/${item.assignmentId}/assessments/${item.assessmentId}`}
    className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
  >
    Start assessment
  </Link>
)}</div>)}</div> : <EmptyState text="Recommendations will appear as your learning history grows." />}</DashboardCard>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardCard title="Assignments" icon={<Clock3 size={20} />}>{dueAssignments.length ? <div className="divide-y divide-slate-100">{dueAssignments.map((assignment) => <Link key={assignment.id} to={`/learning/assignments/${assignment.id}`} className="flex items-center justify-between gap-4 rounded-xl py-4 first:pt-0 last:pb-0 hover:bg-slate-50"><div><p className="font-medium text-slate-900">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">{assignment.dueAt ? "Due " + formatDate(assignment.dueAt) : "No due date"}</p></div><span className="text-xs font-medium capitalize text-slate-500">{assignment.status}</span></Link>)}</div> : <EmptyState text="No published assignments are available." />}</DashboardCard>
      <DashboardCard title="Recent Activity" icon={<TrendingUp size={20} />}>{overview.recentActivity.length ? <div className="divide-y divide-slate-100">{overview.recentActivity.slice(0, 5).map((event) => <div key={event.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-medium text-slate-900">{activityLabel(event.activityType)}</p><p className="mt-1 text-xs text-slate-500">{formatDate(event.occurredAt)}</p></div><span className="text-xs text-slate-400">Learning activity</span></div>)}</div> : <EmptyState text="Your recent learning activity will appear here." />}</DashboardCard>
    </div>
  </div>;
}

function Stat({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}
function DashboardCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-2 text-slate-900"><span className="text-slate-500">{icon}</span><h2 className="text-lg font-semibold">{title}</h2></div>{children}</section>;
}
function EmptyState({ text }: { text: string }) { return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{text}</div>; }



