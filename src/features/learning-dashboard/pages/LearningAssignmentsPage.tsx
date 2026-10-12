import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Clock3, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningRuntimeService } from "@/features/learning-runtime";
import type { LearningAssignmentProgress } from "@/features/learning-assignments";

type AssignmentFilter = "all" | "not_started" | "in_progress" | "completed" | "overdue";

const filters: { value: AssignmentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

function dateLabel(value: string | null) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Due date unavailable";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function LearningAssignmentsPage() {
  const { user } = useAuth();
  const studentUserId = user?.id ?? "";
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<AssignmentFilter>("all");
  const query = useQuery({
    queryKey: ["learning", "student-overview", studentUserId],
    queryFn: () => learningRuntimeService.getStudentOverview(studentUserId),
    enabled: Boolean(studentUserId),
  });

  const progressByAssignment = useMemo(
    () => new Map((query.data?.progress ?? []).map((item) => [item.assignmentId, item])),
    [query.data?.progress],
  );
  const filteredAssignments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return (query.data?.assignments ?? []).filter((assignment) => {
      const status = progressByAssignment.get(assignment.id)?.status ?? "not_started";
      const matchesStatus = activeFilter === "all" || status === activeFilter;
      const searchableText = [assignment.title, assignment.description, assignment.code]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [activeFilter, progressByAssignment, query.data?.assignments, search]);

  if (!user) return <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">Sign in to view your assignments.</div>;
  if (query.isPending) return <div className="space-y-4" aria-label="Loading assignments"><div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" /><div className="h-40 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const { assignments } = query.data;
  const countByStatus = (status: AssignmentFilter) => status === "all"
    ? assignments.length
    : assignments.filter((assignment) => (progressByAssignment.get(assignment.id)?.status ?? "not_started") === status).length;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 px-6 py-7 text-white shadow-xl shadow-violet-200 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-5 -top-8 h-40 w-40 rounded-full border-[18px] border-white/10" />
        <div className="pointer-events-none absolute bottom-[-3rem] right-24 h-28 w-28 rounded-full bg-amber-300/20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold text-violet-50"><Sparkles size={14} /> YOUR NEXT ADVENTURE</span><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">My learning</h1><p className="mt-2 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">Every activity is a chance to discover something new. Pick up where you left off.</p></div>
          <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-extrabold text-violet-700 shadow-sm">{assignments.length} {assignments.length === 1 ? "assignment" : "assignments"}</span>
        </div>
      </section>

      {assignments.length ? (
        <>
          <section className="space-y-4 rounded-[1.75rem] border border-violet-100 bg-white p-4 shadow-sm sm:p-5" aria-label="Find assignments">
            <label htmlFor="assignment-search" className="text-sm font-extrabold text-slate-800">Find an assignment</label>
            <div className="relative">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="assignment-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, description, or code" className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100" />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter assignments by status">
              {filters.map((filter) => {
                const selected = activeFilter === filter.value;
                return <button key={filter.value} type="button" aria-pressed={selected} onClick={() => setActiveFilter(filter.value)} className={["inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold transition", selected ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "bg-violet-50 text-violet-800 hover:bg-violet-100"].join(" ")}>
                  {filter.label}<span className={selected ? "rounded-full bg-white/20 px-1.5 py-0.5" : "rounded-full bg-white px-1.5 py-0.5 text-slate-500"}>{countByStatus(filter.value)}</span>
                </button>;
              })}
            </div>
          </section>

          {filteredAssignments.length ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} progress={progressByAssignment.get(assignment.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-violet-200 bg-white/80 px-6 py-12 text-center shadow-sm">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-600"><Search size={27} /></span>
              <p className="mt-4 text-lg font-extrabold text-slate-800">No matching assignments</p>
              <p className="mt-2 text-sm text-slate-500">Try another search or choose a different status.</p>
              <button type="button" onClick={() => { setSearch(""); setActiveFilter("all"); }} className="mt-4 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-violet-700">Clear filters</button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[2rem] border-2 border-dashed border-violet-200 bg-white/80 px-6 py-12 text-center shadow-sm"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600"><BookOpen size={28} /></span><p className="mt-4 text-lg font-extrabold text-slate-800">Your adventure is getting ready</p><p className="mt-2 text-sm text-slate-500">No published assignments are available for you yet.</p></div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, progress }: { assignment: (Awaited<ReturnType<typeof learningRuntimeService.getStudentOverview>>)["assignments"][number]; progress?: LearningAssignmentProgress }) {
  const status = progress?.status ?? "not_started";
  const statusText = status === "in_progress" ? "In progress" : status === "completed" ? "Completed" : status === "overdue" ? "Overdue" : "Not started";
  const statusClass = status === "completed" ? "bg-emerald-100 text-emerald-700" : status === "overdue" ? "bg-rose-100 text-rose-700" : status === "in_progress" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600";
  const Icon = status === "completed" ? CheckCircle2 : Clock3;

  return (
    <article className="group rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)] transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_16px_36px_rgba(76,29,149,0.12)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 transition group-hover:rotate-3"><BookOpen size={22} /></span>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold leading-6 text-slate-900">{assignment.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{assignment.description || "Learning assignment"}</p>
          </div>
        </div>
        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass}`}><Icon size={13} />{statusText}</span>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-violet-50 pt-4">
        <span className="text-xs text-slate-500">{assignment.dueAt ? `Due ${dateLabel(assignment.dueAt)}` : "No due date"}</span>
        <Link to={`/learning/assignments/${assignment.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700">
          {status === "in_progress" ? "Continue" : status === "completed" ? "Review" : "Open"} <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex items-start gap-3 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-rose-800"><AlertCircle size={20} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Assignments could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-rose-100">Try again</button></div></div>;
}
