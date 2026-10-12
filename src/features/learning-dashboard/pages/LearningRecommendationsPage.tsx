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

  if (!user) return <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">Sign in to view recommendations.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" /><div className="h-48 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-7">

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-400 to-pink-500 px-6 py-7 text-white shadow-xl shadow-orange-100 sm:px-8 sm:py-9"><div className="pointer-events-none absolute -right-4 -top-8 h-36 w-36 rounded-full border-[18px] border-white/15" /><div className="relative"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/85">A PATH MADE FOR YOU</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">What will you discover?</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/90 sm:text-base">Learning activities selected from your mastery and learning history.</p></div></section>
      {(complete.isError || dismiss.isError) && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{complete.isError ? (complete.error instanceof Error ? complete.error.message : "Could not mark this recommendation as reviewed.") : dismiss.error instanceof Error ? dismiss.error.message : "Could not dismiss this recommendation. Please try again."}</div>}
      {query.data.length ? <div className="space-y-4">{query.data.map((item) => <article key={item.id} className="group rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)] transition hover:-translate-y-0.5 hover:border-violet-200 sm:p-6"><div className="flex items-start gap-4"><span className="rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 p-3 text-violet-700"><Compass size={20} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{label(item.recommendationType)}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Priority {item.priority}</span></div><p className="mt-2 text-sm text-slate-600">{reason(item.reason)}</p><p className="mt-2 text-xs text-slate-400">{item.objectiveId ? `Objective: ${item.objectiveId}` : "Personalized learning activity"}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={complete.isPending} onClick={() => complete.mutate(item.id)} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"><CheckCircle2 size={15} /> Mark reviewed</button><button type="button" disabled={dismiss.isPending} onClick={() => dismiss.mutate(item.id)} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 disabled:opacity-50">Dismiss</button>{item.contentItemId && item.assignmentId && <Link to={`/learning/assignments/${item.assignmentId}/content/${item.contentItemId}`} className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-3 py-2 text-sm font-bold text-white hover:bg-violet-700">Open content</Link>}{item.contentItemId && !item.assignmentId && <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">This content is not in a current assignment.</span>}{item.assessmentId && (
  <Link
    to={item.assignmentId ? `/learning/assignments/${item.assignmentId}/assessments/${item.assessmentId}` : "#"}
    className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-3 py-2 text-sm font-bold text-white hover:bg-violet-700"
  >
    Assessment available
  </Link>
)}</div></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Compass className="mx-auto text-slate-400" size={28} /><p className="mt-3 font-medium text-slate-800">No recommendations yet</p><p className="mt-1 text-sm text-slate-500">Recommendations will appear as the learning engine gathers evidence from your activities and assessments.</p><Link to="/learning/assignments" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">View assignments <ArrowRight size={15} /></Link></div>}
    </div>
  );
}
function reason(value: Record<string, unknown>) {
  const candidate = value["reason"] ?? value["message"] ?? value["explanation"];
  return typeof candidate === "string" ? candidate : "This activity was selected to support your next learning step.";
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex items-start gap-3 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-rose-800"><AlertCircle size={20} /><div><p className="font-semibold">Recommendations could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;
}

