import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningRuntimeService } from "@/features/learning-runtime";
import type { LearningAssignmentProgress } from "@/features/learning-assignments";

function dateLabel(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function LearningAssignmentsPage() {
  const { user } = useAuth();
  const studentUserId = user?.id ?? "";
  const query = useQuery({
    queryKey: ["learning", "student-overview", studentUserId],
    queryFn: () => learningRuntimeService.getStudentOverview(studentUserId),
    enabled: Boolean(studentUserId),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view your assignments.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" /><div className="h-40 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const { assignments, progress } = query.data;
  const progressByAssignment = new Map(progress.map((item) => [item.assignmentId, item]));

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-slate-500">Student Learning</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="mt-2 text-sm text-slate-500">Work through assigned learning activities and keep track of what remains.</p>
      </section>
      {assignments.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} progress={progressByAssignment.get(assignment.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No published assignments are available for you yet.</div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, progress }: { assignment: (Awaited<ReturnType<typeof learningRuntimeService.getStudentOverview>>)["assignments"][number]; progress?: LearningAssignmentProgress }) {
  const status = progress?.status ?? "not_started";
  const statusText = status === "in_progress" ? "In progress" : status === "completed" ? "Completed" : status === "overdue" ? "Overdue" : "Not started";
  const Icon = status === "completed" ? CheckCircle2 : Clock3;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-xl bg-slate-100 p-2 text-slate-600"><BookOpen size={20} /></span>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">{assignment.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{assignment.description || "Learning assignment"}</p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><Icon size={13} />{statusText}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">{assignment.dueAt ? `Due ${dateLabel(assignment.dueAt)}` : "No due date"}</span>
        <Link to={`/learning/assignments/${assignment.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
          {status === "in_progress" ? "Continue" : status === "completed" ? "Review" : "Open"} <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Assignments could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;
}

