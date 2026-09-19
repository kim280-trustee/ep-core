import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Clock3, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningRuntimeService } from "@/features/learning-runtime";
import type { LearningAssignmentProgress } from "@/features/learning-assignments";
import { LearningNavigation } from "../components/LearningNavigation";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function activityLabel(type: string) {
  return type.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LearningDashboardPage() {
  const { user } = useAuth();
  const studentUserId = user?.id ?? "";

  const query = useQuery({
    queryKey: ["learning", "student-overview", studentUserId],
    queryFn: () => learningRuntimeService.getStudentOverview(studentUserId),
    enabled: Boolean(studentUserId),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view your learning dashboard.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-2"><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /><div className="h-52 animate-pulse rounded-2xl bg-slate-200" /></div></div>;
  if (query.isError) return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={20} /><div><p className="font-semibold">We could not load your learning dashboard.</p><p className="mt-1 text-sm">Please try again. Your learning data has not been changed.</p><button type="button" onClick={() => void query.refetch()} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;

  const overview = query.data;
  const inProgress = overview.progress.filter((p) => p.status === "in_progress");
  const completed = overview.progress.filter((p) => p.status === "completed");
  const averageMastery = overview.mastery.length ? Math.round(overview.mastery.reduce((sum, item) => sum + item.masteryScore, 0) / overview.mastery.length) : 0;
  const assignmentsById = new Map(overview.assignments.map((a) => [a.id, a]));
  const continueItems = inProgress.map((p) => ({ progress: p, assignment: assignmentsById.get(p.assignmentId) })).filter((x): x is { progress: LearningAssignmentProgress; assignment: NonNullable<typeof x.assignment> } => Boolean(x.assignment)).slice(0, 4);
  const dueAssignments = overview.assignments.filter((a) => a.status === "published").slice(0, 5);

  return <div className="space-y-6">
    <LearningNavigation />
    <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8"><p className="text-sm font-medium text-slate-300">Student Learning</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Welcome back, {user.name || "Student"}</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Continue your learning, review your progress, and see what should come next.</p></section>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat icon={<Target size={19} />} label="Mastery" value={averageMastery + "%"} detail={overview.mastery.length + " objectives"} />
      <Stat icon={<BookOpen size={19} />} label="Assignments" value={String(overview.assignments.length)} detail={inProgress.length + " in progress"} />
      <Stat icon={<CheckCircle2 size={19} />} label="Completed" value={String(completed.length)} detail="assignment progress" />
      <Stat icon={<TrendingUp size={19} />} label="Recommendations" value={String(overview.recommendations.length)} detail="ready for you" />
    </section>
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardCard title="Continue Learning" icon={<BookOpen size={20} />}>{continueItems.length ? <div className="divide-y divide-slate-100">{continueItems.map(({ assignment, progress }) => <div key={progress.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-slate-900">{assignment.title}</h3><p className="mt-1 text-sm text-slate-500">{assignment.description || "Continue this assignment."}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">In progress</span></div></div>)}</div> : <EmptyState text="You have no learning activities in progress yet." />}</DashboardCard>
      <DashboardCard title="Recommended for You" icon={<Target size={20} />}>{overview.recommendations.length ? <div className="space-y-3">{overview.recommendations.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><span className="font-medium capitalize text-slate-900">{item.recommendationType}</span><span className="text-xs text-slate-500">Priority {item.priority}</span></div><p className="mt-1 text-sm text-slate-500">{item.objectiveId ? "Learning objective: " + item.objectiveId : "A learning activity selected for you."}</p></div>)}</div> : <EmptyState text="Recommendations will appear as your learning history grows." />}</DashboardCard>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardCard title="Assignments" icon={<Clock3 size={20} />}>{dueAssignments.length ? <div className="divide-y divide-slate-100">{dueAssignments.map((assignment) => <div key={assignment.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-medium text-slate-900">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">{assignment.dueAt ? "Due " + formatDate(assignment.dueAt) : "No due date"}</p></div><span className="text-xs font-medium capitalize text-slate-500">{assignment.status}</span></div>)}</div> : <EmptyState text="No published assignments are available." />}</DashboardCard>
      <DashboardCard title="Recent Activity" icon={<TrendingUp size={20} />}>{overview.recentActivity.length ? <div className="divide-y divide-slate-100">{overview.recentActivity.slice(0, 5).map((event) => <div key={event.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-medium text-slate-900">{activityLabel(event.activityType)}</p><p className="mt-1 text-xs text-slate-500">{formatDate(event.occurredAt)}</p></div><span className="text-xs text-slate-400">Learning activity</span></div>)}</div> : <EmptyState text="Your recent learning activity will appear here." />}</DashboardCard>
    </div>
  </div>;
}

function Stat({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}
function DashboardCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center gap-2 text-slate-900"><span className="text-slate-500">{icon}</span><h2 className="text-lg font-semibold">{title}</h2></div>{children}</section>;
}
function EmptyState({ text }: { text: string }) { return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{text}</div>; }
