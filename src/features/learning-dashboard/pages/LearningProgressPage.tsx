import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AlertCircle, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningMasteryService } from "@/features/learning-mastery";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "@/features/learning-assessment";

const stateLabel: Record<string, string> = {
  not_started: "Not started",
  developing: "Developing",
  proficient: "Proficient",
  mastered: "Mastered",
  needs_review: "Needs review",
};

function isCorrectionEvent(event: { evidence: Record<string, unknown> }) {
  return event.evidence["type"] === "pilot_data_correction";
}

export default function LearningProgressPage() {
  const { user } = useAuth();
  const id = user?.id ?? "";

  const query = useQuery({
    queryKey: ["learning", "progress", id],
    queryFn: async () => {
      const [mastery, events, assignments, assignmentProgress, assessmentResults] = await Promise.all([
        learningMasteryService.listStudentMastery(id),
        learningMasteryService.listMasteryEvents(id),
        learningAssignmentsService.listStudentAssignments(user!.id),
        learningAssignmentsService.listProgress(id),
        learningAssessmentService.listResults(id),
      ]);
      return { mastery, events, assignments, assignmentProgress, assessmentResults };
    },
    enabled: Boolean(id),
  });

  if (!user) {
    return (
      <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-sm">
        Sign in to view your progress.
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const { mastery, events, assignments, assignmentProgress, assessmentResults } = query.data;
  const average = mastery.length
    ? Math.round(
        mastery.reduce((sum, item) => sum + item.masteryScore, 0) / mastery.length,
      )
    : 0;
  const needsReview = mastery.filter(
    (item) => item.state === "needs_review",
  ).length;

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-400 px-6 py-7 text-white shadow-xl shadow-sky-100 sm:px-8 sm:py-9">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/80">YOUR GROWTH STORY</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Look how far you’ve come!</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/90 sm:text-base">See how your learning objectives are developing over time.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Average mastery"
          value={mastery.length ? `${average}%` : "—"}
          icon={<Target size={18} />}
        />
        <Metric
          label="Objectives tracked"
          value={String(mastery.length)}
          icon={<TrendingUp size={18} />}
        />
        <Metric
          label="Needs review"
          value={String(needsReview)}
          icon={<AlertCircle size={18} />}
        />
      </div>

      <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Assignment progress</h2>
        <p className="mt-1 text-sm text-slate-500">Your assigned learning activities and completion status.</p>
        <div className="mt-4 divide-y divide-slate-100">
          {assignments.length ? assignments.map((assignment) => {
            const progressItem = assignmentProgress.find((item) => item.assignmentId === assignment.id);
            const status = progressItem?.status ?? "not_started";
            return (
              <div key={assignment.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{assignment.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{assignment.code}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "completed" ? "bg-emerald-100 text-emerald-700" : status === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                  {status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : "Not started"}
                </span>
              </div>
            );
          }) : <p className="text-sm text-slate-500">No published assignments yet.</p>}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Assessment results</h2>
        <p className="mt-1 text-sm text-slate-500">Scores from completed assessment attempts.</p>
        <div className="mt-4 divide-y divide-slate-100">
          {assessmentResults.length ? assessmentResults.slice(0, 20).map((result) => (
            <div key={result.id} className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0">
              <div>
                <p className="text-sm font-medium text-slate-800">Assessment attempt</p>
                <p className="mt-1 text-xs text-slate-500">
                  Evaluated {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(result.evaluatedAt))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{result.score ?? 0} / {result.maxScore ?? 0}</p>
                <p className="text-xs font-semibold text-slate-500">{result.percentage ?? 0}% · {result.passed ? "Passed" : "Not passed"}</p>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">No assessment results have been recorded yet.</p>}
        </div>
      </section>


      <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Objective mastery
        </h2>
        <div className="mt-5 space-y-4">
          {mastery.length ? (
            mastery.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-800">
                    Objective {item.objectiveId}
                  </span>
                  <span className="text-slate-500">
                    {Math.round(item.masteryScore)}% ·{" "}
                    {stateLabel[item.state] ?? item.state}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, item.masteryScore))}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Mastery data will appear after you complete learning activities
              and assessments.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Learning history
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Recorded changes to your mastery and assessment evidence.
        </p>

        <div className="mt-4 divide-y divide-slate-100">
          {events.length ? (
            events.slice(0, 20).map((event) => {
              const correction = isCorrectionEvent(event);

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {correction
                        ? "Mastery data correction"
                        : `Objective ${event.objectiveId}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {correction
                        ? "Pilot seed correction recorded without changing assessment evidence"
                        : event.attemptId
                          ? `Assessment attempt ${event.attemptId}`
                          : "Mastery update"}
                    </p>
                  </div>
                  <span className="text-sm text-slate-600">
                    {event.previousScore == null
                      ? "New"
                      : `${Math.round(event.previousScore)}% → ${Math.round(event.newScore)}%`}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">
              No mastery events have been recorded yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-violet-100 bg-white p-5 shadow-[0_8px_28px_rgba(76,29,149,0.06)]">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-black text-violet-700">{value}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-rose-800">
      <AlertCircle size={20} />
      <div>
        <p className="font-semibold">Progress could not be loaded.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-rose-100"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
