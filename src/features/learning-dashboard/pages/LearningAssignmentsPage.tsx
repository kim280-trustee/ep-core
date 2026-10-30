import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Clock3, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningRuntimeService } from "@/features/learning-runtime";
import type { LearningAssignmentProgress } from "@/features/learning-assignments";

function dateLabel(value: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

type AssignmentFilter = "all" | "not_started" | "in_progress" | "completed" | "overdue";

const filterOptions: { value: AssignmentFilter; label: string }[] = [
  { value: "all", label: "All assignments" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

export default function LearningAssignmentsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<AssignmentFilter>("all");
  const [searchText, setSearchText] = useState("");
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
  const counts = {
    all: assignments.length,
    not_started: assignments.filter((item) => (progressByAssignment.get(item.id)?.status ?? "not_started") === "not_started").length,
    in_progress: assignments.filter((item) => progressByAssignment.get(item.id)?.status === "in_progress").length,
    completed: assignments.filter((item) => progressByAssignment.get(item.id)?.status === "completed").length,
    overdue: assignments.filter((item) => progressByAssignment.get(item.id)?.status === "overdue").length,
  };
  const search = searchText.trim().toLocaleLowerCase();
  const filteredAssignments = assignments.filter((assignment) => {
    const status = progressByAssignment.get(assignment.id)?.status ?? "not_started";
    const matchesFilter = filter === "all" || status === filter;
    const matchesSearch = !search || [assignment.title, assignment.code, assignment.description ?? ""]
      .some((value) => value.toLocaleLowerCase().includes(search));
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
    return aDue - bDue || a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-slate-500">Student Learning</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Assignments</h1><p className="mt-2 text-sm text-slate-500">Work through assigned learning activities and keep track of what remains.</p></div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{assignments.length} {assignments.length === 1 ? "assignment" : "assignments"}</span>
      </section>
      {assignments.length > 0 && (
        <section aria-label="Filter assignments" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block flex-1">
              <span className="sr-only">Search assignments</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search title, code, or description" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-500"><SlidersHorizontal size={16} /> {filteredAssignments.length} of {assignments.length}</div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Assignment status">
            {filterOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => setFilter(option.value)} aria-pressed={filter === option.value} className={"rounded-full border px-3 py-2 text-xs font-semibold transition " + (filter === option.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>
                {option.label} ({counts[option.value]})
              </button>
            ))}
          </div>
        </section>
      )}
      {filteredAssignments.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} progress={progressByAssignment.get(assignment.id)} />
          ))}
        </div>
      ) : assignments.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-semibold text-slate-800">No assignments match these filters.</p><p className="mt-1 text-sm text-slate-500">Try another status or search term.</p><button type="button" onClick={() => { setFilter("all"); setSearchText(""); }} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Clear filters</button></div>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="rounded-xl bg-slate-100 p-2 text-slate-600"><BookOpen size={20} /></span>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900">{assignment.title}</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Code: {assignment.code}</p>
            <p className="mt-1 text-sm text-slate-500">{assignment.description || "Learning assignment"}</p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><Icon size={13} />{statusText}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">{assignment.dueAt ? `Due ${dateLabel(assignment.dueAt)}` : "No due date"}</span>
        <Link to={`/learning/assignments/${assignment.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          {status === "in_progress" ? "Continue" : status === "completed" ? "Review" : "Open"} <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Assignments could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;
}

