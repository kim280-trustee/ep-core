import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AlertCircle, Target, TrendingUp } from "lucide-react";
import { useAuth } from "@/core/auth";
import { learningMasteryService } from "@/features/learning-mastery";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "@/features/learning-assessment";
import { learningContentService } from "@/features/learning-content";
import { Link } from "react-router-dom";

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
  const [masterySearch, setMasterySearch] = useState("");
  const [masteryState, setMasteryState] = useState("all");
  const [masterySort, setMasterySort] = useState<"lowest" | "highest" | "state">("lowest");

  const query = useQuery({
    queryKey: ["learning", "progress", id],
    queryFn: async () => {
      const [mastery, events, assignments, assignmentProgress, assessmentResults, contentResponses] = await Promise.all([
        learningMasteryService.listStudentMastery(id),
        learningMasteryService.listMasteryEvents(id),
        learningAssignmentsService.listStudentAssignments(user!.id),
        learningAssignmentsService.listProgress(id),
        learningAssessmentService.listResults(id),
        learningContentService.listStudentResponses(id),
      ]);
      return { mastery, events, assignments, assignmentProgress, assessmentResults, contentResponses };
    },
    enabled: Boolean(id),
  });

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
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

  const { mastery, events, assignments, assignmentProgress, assessmentResults, contentResponses } = query.data;
  const average = mastery.length
    ? Math.round(
        mastery.reduce((sum, item) => sum + item.masteryScore, 0) / mastery.length,
      )
    : 0;
  const needsReview = mastery.filter(
    (item) => item.state === "needs_review",
  ).length;
  const normalizedMasterySearch = masterySearch.trim().toLocaleLowerCase();
  const visibleMastery = mastery
    .filter((item) => masteryState === "all" || item.state === masteryState)
    .filter((item) => !normalizedMasterySearch || item.objectiveId.toLocaleLowerCase().includes(normalizedMasterySearch))
    .sort((a, b) => masterySort === "highest"
      ? b.masteryScore - a.masteryScore
      : masterySort === "state"
        ? (stateLabel[a.state] ?? a.state).localeCompare(stateLabel[b.state] ?? b.state)
        : a.masteryScore - b.masteryScore);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-slate-500">Student Learning</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Progress</h1>
        <p className="mt-2 text-sm text-slate-500">
          See how your learning objectives are developing over time.
        </p>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Assignment progress</h2>
        <p className="mt-1 text-sm text-slate-500">Your assigned learning activities and completion status.</p>
        <div className="mt-4 divide-y divide-slate-100">
          {assignments.length ? assignments.map((assignment) => {
            const progressItem = assignmentProgress.find((item) => item.assignmentId === assignment.id);
            const status = progressItem?.status ?? "not_started";
            const responsesForAssignment = contentResponses
              .filter((item) => item.assignmentId === assignment.id && item.status === "submitted")
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            return (
              <div key={assignment.id} className="py-3 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{assignment.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{assignment.code}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status === "completed" ? "bg-emerald-100 text-emerald-700" : status === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                    {status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : "Not started"}
                  </span>
                </div>
                {responsesForAssignment.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {responsesForAssignment.map((response) => {
                      const percentage = response.score !== null && response.maxScore !== null && response.maxScore > 0
                        ? (response.score / response.maxScore) * 100
                        : null;
                      return (
                        <div key={response.id} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted content response</p>
                          {response.score !== null && response.maxScore !== null ? (
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              Grade: {response.score}/{response.maxScore}{percentage !== null ? ` · ${percentage.toFixed(2)}%` : ""}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm font-medium text-slate-600">Submitted — awaiting teacher grading</p>
                          )}
                          {response.teacherFeedback?.trim() && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teacher feedback</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{response.teacherFeedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <Link to={`/learning/assignments/${assignment.id}`} className="inline-flex text-sm font-semibold text-blue-700 hover:underline">
                      Review assignment results
                    </Link>
                  </div>
                )}
              </div>
            );
          }) : <p className="text-sm text-slate-500">No published assignments yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
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


      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Objective mastery
        </h2>
        <p className="mt-1 text-sm text-slate-500">Find objectives that need attention or review your strongest areas.</p>
        {mastery.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Search objective
              <input type="search" value={masterySearch} onChange={(event) => setMasterySearch(event.target.value)} placeholder="Enter objective ID…" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Mastery state
              <select value={masteryState} onChange={(event) => setMasteryState(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200">
                <option value="all">All states</option>
                <option value="needs_review">Needs review</option>
                <option value="developing">Developing</option>
                <option value="proficient">Proficient</option>
                <option value="mastered">Mastered</option>
                <option value="not_started">Not started</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Sort by
              <select value={masterySort} onChange={(event) => setMasterySort(event.target.value as typeof masterySort)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200">
                <option value="lowest">Lowest mastery first</option>
                <option value="highest">Highest mastery first</option>
                <option value="state">Mastery state</option>
              </select>
            </label>
            <p className="text-xs text-slate-500 sm:col-span-3" aria-live="polite">Showing {visibleMastery.length} of {mastery.length} objectives.</p>
          </div>
        )}
        <div className="mt-5 space-y-4">
          {mastery.length ? visibleMastery.length ? (
            visibleMastery.map((item) => (
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
                    className="h-full rounded-full bg-slate-900"
                    style={{
                      width: `${Math.max(0, Math.min(100, item.masteryScore))}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm text-slate-600">No objectives match these filters.</p>
              <button type="button" onClick={() => { setMasterySearch(""); setMasteryState("all"); setMasterySort("lowest"); }} className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">Clear filters</button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Mastery data will appear after you complete learning activities
              and assessments.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Assessment history
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your assessment evidence is retained as part of your learning
          history.
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
      <AlertCircle size={20} />
      <div>
        <p className="font-semibold">Progress could not be loaded.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
