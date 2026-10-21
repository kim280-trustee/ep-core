import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, BookOpen, CalendarDays, CheckCircle2, Compass, Languages, RefreshCw, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { organizationService } from "@/core/organization";
import { learningActivityService } from "@/features/learning-activity";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningRuntimeService } from "@/features/learning-runtime";
import { learningRewardsService, calculateLearningStreak, getVerifiedLearningActivityTimestamps } from "@/features/learning-rewards";
import { learningVocabularyService } from "@/features/learning-vocabulary";

function localDayKey(value: Date) {
  return value.getFullYear() + "-" + String(value.getMonth() + 1).padStart(2, "0") + "-" + String(value.getDate()).padStart(2, "0");
}

function formatDueDate(value: string | null | undefined) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Due date unavailable";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export default function LearningDailyHubPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");

  const membershipsQuery = useQuery({
    queryKey: ["learning", "daily-hub-memberships", userId],
    queryFn: () => learningEnrollmentService.listUserClasses(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const organizationsQuery = useQuery({
    queryKey: ["learning", "daily-hub-organizations", userId],
    queryFn: () => organizationService.getOrganizations(),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  const activeStudentMemberships = (membershipsQuery.data ?? []).filter(
    (membership) => membership.status === "active" && membership.membershipType === "student",
  );
  const organizationIds = [...new Set(activeStudentMemberships.map((membership) => membership.organizationId))];
  const organizationId = selectedOrganizationId && organizationIds.includes(selectedOrganizationId)
    ? selectedOrganizationId
    : organizationIds[0] ?? "";

  const overviewQuery = useQuery({
    queryKey: ["learning", "daily-hub-overview", userId],
    queryFn: () => learningRuntimeService.getStudentOverview(userId),
    enabled: Boolean(userId),
  });

  const vocabularyQuery = useQuery({
    queryKey: ["learning", "daily-hub-vocabulary", userId, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return { organizationId: null, dueEntries: [], publishedCount: 0 };
      }

      const [entries, progress] = await Promise.all([
        learningVocabularyService.listEntries(organizationId, false),
        learningVocabularyService.listProgress(organizationId, userId),
      ]);
      const progressByEntry = new Map(progress.map((item) => [item.vocabularyEntryId, item]));
      const now = Date.now();
      const dueEntries = entries
        .filter((entry) => {
          const savedProgress = progressByEntry.get(entry.id);
          if (!savedProgress) return true;
          const nextReviewAt = Date.parse(savedProgress.nextReviewAt);
          return !Number.isFinite(nextReviewAt) || nextReviewAt <= now;
        })
        .sort((a, b) => {
          const aDue = progressByEntry.get(a.id)?.nextReviewAt;
          const bDue = progressByEntry.get(b.id)?.nextReviewAt;
          if (!aDue && bDue) return -1;
          if (aDue && !bDue) return 1;
          return (aDue ?? "").localeCompare(bDue ?? "") || a.word.localeCompare(b.word);
        });

      return { organizationId, dueEntries, publishedCount: entries.length };
    },
    enabled: Boolean(userId && organizationId),
  });

  const dailyXpGoalQuery = useQuery({
    queryKey: ["learning", "daily-xp-goal", userId],
    queryFn: () => learningRewardsService.getStudentDailyXpGoal(),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  const rewardsQuery = useQuery({
    queryKey: ["learning", "daily-hub-rewards", userId],
    queryFn: async () => {
      const [ledger, completions] = await Promise.all([
        learningRewardsService.listStudentLedger(userId),
        learningActivityService.listValidatedContentCompletions(userId),
      ]);
      const todayKey = localDayKey(new Date());
      return {
        xp: ledger.reduce((total, entry) => total + entry.xpDelta, 0),
        xpToday: ledger
          .filter((entry) => localDayKey(new Date(entry.occurredAt)) === todayKey)
          .reduce((total, entry) => total + entry.xpDelta, 0),
        streak: calculateLearningStreak(getVerifiedLearningActivityTimestamps(completions, ledger)),
      };
    },
    enabled: Boolean(userId),
  });

  if (!user) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view your daily learning plan.</div>;
  }

  if (overviewQuery.isPending) {
    return <div className="space-y-4"><div className="h-36 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-3"><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /></div></div>;
  }

  if (overviewQuery.isError) {
    return <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800" role="alert">
      <div className="flex items-start gap-3"><AlertCircle size={20} /><div><h1 className="font-semibold">Your daily learning plan could not be loaded.</h1><p className="mt-1 text-sm">Your saved learning data has not been changed. Try again.</p><button type="button" onClick={() => void overviewQuery.refetch()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold"><RefreshCw size={15} /> Try again</button></div></div>
    </section>;
  }

  const overview = overviewQuery.data;
  const completedIds = new Set(overview.progress.filter((item) => item.status === "completed").map((item) => item.assignmentId));
  const openAssignments = overview.assignments
    .filter((assignment) => assignment.status === "published" && !completedIds.has(assignment.id))
    .sort((a, b) => {
      if (!a.dueAt && b.dueAt) return 1;
      if (a.dueAt && !b.dueAt) return -1;
      return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
    });
  const dueVocabulary = vocabularyQuery.data?.dueEntries ?? [];
  const nextAssignment = openAssignments[0];
  const nextRecommendation = overview.recommendations[0];
  const nextAction = dueVocabulary.length > 0
    ? { title: "Review vocabulary", description: `${dueVocabulary.length} word${dueVocabulary.length === 1 ? "" : "s"} ready for spaced review.`, to: "/learning/vocabulary", label: "Start review", icon: Languages }
    : nextAssignment
      ? { title: "Continue an assignment", description: nextAssignment.title, to: `/learning/assignments/${nextAssignment.id}`, label: "Open assignment", icon: BookOpen }
      : nextRecommendation
        ? { title: "Practice a recommended skill", description: "Use your learning recommendations to decide what to practice next.", to: "/learning/recommendations", label: "View recommendation", icon: Compass }
        : { title: "Check your progress", description: "Review your learning history and see what you have completed.", to: "/learning/progress", label: "View progress", icon: Target };
  const NextActionIcon = nextAction.icon;

  return <div className="space-y-6">
    <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-200"><CalendarDays size={16} /> Daily Learning Hub</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Your plan for today</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">A practical next step based on your saved assignments, vocabulary review schedule and learning recommendations.</p>
        </div>
        {rewardsQuery.isSuccess && <div className="min-w-48 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold"><Zap size={16} /> {rewardsQuery.data.xp} XP total</p>
          <p className="mt-1 text-xs text-slate-300">{rewardsQuery.data.streak} day learning streak</p>
          {dailyXpGoalQuery.isSuccess && <div className="mt-3">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-200">
              <span>Today's XP goal</span>
              <span className="font-semibold tabular-nums">{rewardsQuery.data.xpToday} / {dailyXpGoalQuery.data} XP</span>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-label="Today's XP goal progress"
              aria-valuemin={0}
              aria-valuemax={dailyXpGoalQuery.data}
              aria-valuenow={Math.max(0, rewardsQuery.data.xpToday)}
            >
              <div
                className="h-full rounded-full bg-sky-300 transition-[width]"
                style={{ width: Math.min(100, Math.max(0, Math.round((rewardsQuery.data.xpToday / Math.max(1, dailyXpGoalQuery.data)) * 100))) + "%" }}
              />
            </div>
          </div>}
        </div>}
      </div>
    </section>

    {organizationIds.length > 1 && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block max-w-xl text-sm font-semibold text-slate-700">School for vocabulary review
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
          value={organizationId}
          onChange={(event) => setSelectedOrganizationId(event.target.value)}
        >
          {organizationIds.map((id) => {
            const organization = (organizationsQuery.data ?? []).find((item) => item.id === id);
            return <option key={id} value={id}>{organization?.name ?? "School " + id.slice(0, 8)}</option>;
          })}
        </select>
      </label>
      <p className="mt-2 text-xs text-slate-500">Vocabulary review is loaded only for the selected school. Your assignments and progress remain combined in the existing learning overview.</p>
    </section>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Today's learning summary">
      <SummaryCard icon={<Languages size={19} />} label="Vocabulary due" value={vocabularyQuery.isSuccess ? String(dueVocabulary.length) : "—"} detail={vocabularyQuery.data?.publishedCount ? `of ${vocabularyQuery.data.publishedCount} published words` : "Spaced review"} />
      <SummaryCard icon={<BookOpen size={19} />} label="Open assignments" value={String(openAssignments.length)} detail="Published and not completed" />
      <SummaryCard icon={<Compass size={19} />} label="Recommendations" value={String(overview.recommendations.length)} detail="Based on recorded learning" />
      <SummaryCard icon={<CheckCircle2 size={19} />} label="Completed assignments" value={String(completedIds.size)} detail="Saved completion records" />
    </section>

    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <span className="rounded-xl bg-white p-3 text-sky-800 shadow-sm"><NextActionIcon size={22} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sky-800">Recommended next step</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{nextAction.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{nextAction.description}</p>
          <Link to={nextAction.to} className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">{nextAction.label}</Link>
        </div>
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2"><Languages size={20} className="text-slate-500" /><h2 className="text-lg font-semibold text-slate-900">Vocabulary to review</h2></div>
        {membershipsQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading your school memberships…</p>
          : membershipsQuery.isError ? <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900" role="alert"><p>Your school memberships could not be loaded. Assignments and recommendations are still available.</p><button type="button" onClick={() => void membershipsQuery.refetch()} className="mt-2 inline-flex items-center gap-2 font-semibold underline"><RefreshCw size={14} /> Retry school access</button></div>
            : !organizationId ? <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No active student school membership was found. Your assignments and recommendations remain available.</div>
              : vocabularyQuery.isPending ? <p className="mt-4 text-sm text-slate-500">Loading your review schedule…</p>
                : vocabularyQuery.isError ? <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900" role="alert"><p>Vocabulary review could not be loaded for this school. Your assignments and recommendations are still available.</p><button type="button" onClick={() => void vocabularyQuery.refetch()} className="mt-2 inline-flex items-center gap-2 font-semibold underline"><RefreshCw size={14} /> Retry vocabulary</button></div>
                  : dueVocabulary.length ? <div className="mt-4 space-y-3">{dueVocabulary.slice(0, 5).map((entry) => <article key={entry.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold text-slate-900">{entry.word}</h3><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{entry.difficulty}</span></div><p className="mt-1 text-sm text-slate-600">{entry.definition}</p>{entry.translation && <p className="mt-1 text-sm text-slate-500">{entry.translation}</p>}</article>)}<Link to="/learning/vocabulary" className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">Review vocabulary</Link></div>
              : <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{vocabularyQuery.data?.publishedCount ? "You are up to date. No vocabulary is due for review right now." : "No published vocabulary is available in your current class yet."}<div className="mt-3"><Link to="/learning/vocabulary" className="font-semibold text-slate-900 underline">Open vocabulary</Link></div></div>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2"><BookOpen size={20} className="text-slate-500" /><h2 className="text-lg font-semibold text-slate-900">Assignments to continue</h2></div>
        {openAssignments.length ? <div className="mt-4 space-y-3">{openAssignments.slice(0, 5).map((assignment) => <Link key={assignment.id} to={`/learning/assignments/${assignment.id}`} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><div><h3 className="font-semibold text-slate-900">{assignment.title}</h3><p className="mt-1 text-sm text-slate-500">{assignment.description || "Continue this learning activity."}</p></div><span className="shrink-0 text-xs text-slate-500">{formatDueDate(assignment.dueAt)}</span></Link>)}</div>
          : <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No unfinished published assignments. Check your recommendations for a useful next step.</div>}
        <Link to="/learning/assignments" className="mt-4 inline-flex font-semibold text-slate-900 underline">View all assignments</Link>
      </section>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2"><Target size={20} className="text-slate-500" /><h2 className="text-lg font-semibold text-slate-900">Recommendations</h2></div>
      {overview.recommendations.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{overview.recommendations.slice(0, 4).map((item) => <article key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold capitalize text-slate-900">{item.recommendationType.replaceAll("_", " ")}</h3><span className="text-xs text-slate-500">Priority {item.priority}</span></div><p className="mt-2 break-words text-sm text-slate-600">{item.objectiveId ? "Learning objective: " + item.objectiveId : "A practice activity selected from your learning history."}</p></article>)}</div>
        : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Recommendations will appear as more learning evidence is recorded.</p>}
      <Link to="/learning/recommendations" className="mt-4 inline-flex font-semibold text-slate-900 underline">Explore recommendations</Link>
    </section>
  </div>;
}

function SummaryCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}
