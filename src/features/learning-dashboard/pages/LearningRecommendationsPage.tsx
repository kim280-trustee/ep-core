import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, CheckCircle2, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningMasteryService } from "@/features/learning-mastery";
import { learningAssignmentsService } from "@/features/learning-assignments";

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

export default function LearningRecommendationsPage() {
  const { user } = useAuth();
  const id = user?.id ?? "";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "content" | "assessment" | "high_priority">("all");
  const query = useQuery({
    queryKey: ["learning", "recommendations", id],
    queryFn: async () => {
      const recommendations = await learningMasteryService.listRecommendations(id);
      const assignments = await learningAssignmentsService.listStudentAssignments(id);
      const candidates = await Promise.all(assignments.map(async (assignment) => ({
        assignmentId: assignment.id,
        items: await learningAssignmentsService.listItems(assignment.id),
      })));
      return (await Promise.all(recommendations.map(async (item) => {
        const candidate = candidates.find(({ items }) => items.some((activity) =>
          item.assessmentId
            ? activity.itemType === "assessment" && activity.assessmentId === item.assessmentId
            : item.contentItemId
              ? activity.itemType === "content" && activity.contentItemId === item.contentItemId
              : false
        ));
        return { ...item, assignmentId: candidate?.assignmentId ?? null };
      }))).filter((item) => !item.assessmentId || Boolean(item.assignmentId));
    },
    enabled: Boolean(id),
  });
  const dismiss = useMutation({
    mutationFn: (recommendationId: string) => learningMasteryService.dismissRecommendation(recommendationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "recommendations", id] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "student-overview", id] });
    },
  });
  const complete = useMutation({
    mutationFn: (recommendationId: string) => learningMasteryService.completeRecommendation(recommendationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning", "recommendations", id] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "student-overview", id] });
    },
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view recommendations.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" /><div className="h-48 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredRecommendations = query.data
    .filter((item) => {
      if (filter === "content" && !item.contentItemId) return false;
      if (filter === "assessment" && !item.assessmentId) return false;
      if (filter === "high_priority" && item.priority < 4) return false;
      if (!normalizedSearch) return true;
      return [label(item.recommendationType), reason(item.reason), item.objectiveId ?? ""]
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
    })
    .sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-6">

      <section><p className="text-sm font-medium text-slate-500">Student Learning</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Recommended for You</h1><p className="mt-2 text-sm text-slate-500">Learning activities selected from your mastery and learning history.</p></section>
      {query.data.length > 0 && (
        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
          <label className="block text-sm font-medium text-slate-700">
            Search recommendations
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search type, reason, or objective…" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Filter
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200">
              <option value="all">All recommendations</option>
              <option value="high_priority">High priority (4–5)</option>
              <option value="content">Content activities</option>
              <option value="assessment">Assessments</option>
            </select>
          </label>
          <p className="text-xs text-slate-500 sm:col-span-2" aria-live="polite">Showing {filteredRecommendations.length} of {query.data.length} recommendations, highest priority first.</p>
        </section>
      )}
      {query.data.length ? filteredRecommendations.length ? <div className="space-y-4">{filteredRecommendations.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 sm:p-6"><div className="flex items-start gap-4"><span className="rounded-xl bg-slate-100 p-2 text-slate-600"><Compass size={20} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{label(item.recommendationType)}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Priority {item.priority}</span></div><p className="mt-2 text-sm text-slate-600">{reason(item.reason)}</p><p className="mt-2 text-xs text-slate-400">{item.objectiveId ? `Objective: ${item.objectiveId}` : "Personalized learning activity"}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={complete.isPending} onClick={() => complete.mutate(item.id)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"><CheckCircle2 size={15} /> Mark reviewed</button><button type="button" disabled={dismiss.isPending} onClick={() => dismiss.mutate(item.id)} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 disabled:opacity-50">Dismiss</button>{item.contentItemId && item.assignmentId && <Link to={`/learning/assignments/${item.assignmentId}/content/${item.contentItemId}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">Open content</Link>}{item.contentItemId && !item.assignmentId && <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">This content is not in a current assignment.</span>}{item.assessmentId && (
  <Link
    to={item.assignmentId ? `/learning/assignments/${item.assignmentId}/assessments/${item.assessmentId}` : "#"}
    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
  >
    Assessment available
  </Link>
)}</div></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-medium text-slate-800">No recommendations match these filters</p><p className="mt-1 text-sm text-slate-500">Try a different search or show all recommendations.</p><button type="button" onClick={() => { setSearch(""); setFilter("all"); }} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Clear filters</button></div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Compass className="mx-auto text-slate-400" size={28} /><p className="mt-3 font-medium text-slate-800">No recommendations yet</p><p className="mt-1 text-sm text-slate-500">Recommendations will appear as the learning engine gathers evidence from your activities and assessments.</p><Link to="/learning/assignments" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">View assignments <ArrowRight size={15} /></Link></div>}
    </div>
  );
}
function reason(value: Record<string, unknown>) {
  const candidate = value["reason"] ?? value["message"] ?? value["explanation"];
  return typeof candidate === "string" ? candidate : "This activity was selected to support your next learning step.";
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} /><div><p className="font-semibold">Recommendations could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;
}

