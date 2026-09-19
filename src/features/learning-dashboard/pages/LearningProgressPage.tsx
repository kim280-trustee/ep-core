import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningMasteryService } from "@/features/learning-mastery";
import { LearningNavigation } from "../components/LearningNavigation";

const stateLabel: Record<string, string> = {
  not_started: "Not started",
  developing: "Developing",
  proficient: "Proficient",
  mastered: "Mastered",
  needs_review: "Needs review",
};

export default function LearningProgressPage() {
  const { user } = useAuth();
  const id = user?.id ?? "";
  const query = useQuery({
    queryKey: ["learning", "progress", id],
    queryFn: async () => {
      const [mastery, events] = await Promise.all([learningMasteryService.listStudentMastery(id), learningMasteryService.listMasteryEvents(id)]);
      return { mastery, events };
    },
    enabled: Boolean(id),
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to view your progress.</div>;
  if (query.isPending) return <div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" /><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const { mastery, events } = query.data;
  const average = mastery.length ? Math.round(mastery.reduce((sum, item) => sum + item.masteryScore, 0) / mastery.length) : 0;
  const needsReview = mastery.filter((item) => item.state === "needs_review").length;
  return (
    <div className="space-y-6">
      <LearningNavigation />
      <section><p className="text-sm font-medium text-slate-500">Student Learning</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Progress</h1><p className="mt-2 text-sm text-slate-500">See how your learning objectives are developing over time.</p></section>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Average mastery" value={`${average}%`} icon={<Target size={18} />} />
        <Metric label="Objectives tracked" value={String(mastery.length)} icon={<TrendingUp size={18} />} />
        <Metric label="Needs review" value={String(needsReview)} icon={<AlertCircle size={18} />} />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Objective mastery</h2>
        <div className="mt-5 space-y-4">
          {mastery.length ? mastery.map((item) => <div key={item.id}><div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-800">Objective {item.objectiveId}</span><span className="text-slate-500">{Math.round(item.masteryScore)}% · {stateLabel[item.state] ?? item.state}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(0, Math.min(100, item.masteryScore))}%` }} /></div></div>) : <p className="text-sm text-slate-500">Mastery data will appear after you complete learning activities and assessments.</p>}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Assessment history</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {events.length ? events.slice(0, 20).map((event) => <div key={event.id} className="flex items-center justify-between gap-4 py-3 first:pt-0"><div><p className="text-sm font-medium text-slate-800">Objective {event.objectiveId}</p><p className="mt-1 text-xs text-slate-500">{event.attemptId ? `Assessment attempt ${event.attemptId}` : "Mastery update"}</p></div><span className="text-sm text-slate-600">{event.previousScore == null ? "New" : `${Math.round(event.previousScore)}% → ${Math.round(event.newScore)}%`}</span></div>) : <p className="text-sm text-slate-500">No mastery events have been recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></div>;
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} /><div><p className="font-semibold">Progress could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm">Try again</button></div></div>;
}
