import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { learningContentService } from "@/features/learning-content";

type GradeDraft = { score: string; maxScore: string; feedback: string };

export default function TeacherContentResponsesPage() {
  const { assignmentId = "" } = useParams();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
  const [savedResponseIds, setSavedResponseIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "awaiting" | "graded">("all");
  const responses = useQuery({
    queryKey: ["learning", "teacher-content-responses", assignmentId],
    queryFn: () => learningContentService.listTeacherResponses(assignmentId),
    enabled: Boolean(assignmentId),
  });
  const grade = useMutation({
    mutationFn: ({ responseId, score, maxScore, feedback }: { responseId: string; score: number; maxScore: number; feedback: string }) =>
      learningContentService.gradeTeacherResponse({ responseId, score, maxScore, teacherFeedback: feedback }),
    onSuccess: (_result, variables) => {
      setSavedResponseIds((current) => [...new Set([...current, variables.responseId])]);
      void queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-responses", assignmentId] });
      void queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });

  if (!assignmentId) return <Message text="No assignment was selected." />;
  if (responses.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (responses.isError) return <Message text={responses.error instanceof Error ? responses.error.message : "Responses could not be loaded."} />;

  const allItems = responses.data ?? [];
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const items = allItems.filter((item) => {
    const matchesSearch = !normalizedSearch || [item.studentName, item.studentEmail ?? "", item.responseText ?? ""].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
    const isGraded = item.score !== null && item.maxScore !== null;
    const matchesStatus = statusFilter === "all" || (statusFilter === "submitted" && item.status === "submitted") || (statusFilter === "awaiting" && item.status !== "submitted") || (statusFilter === "graded" && isGraded);
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16} />Teacher Dashboard</Link>
      <header className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">Teacher Assessment</p>
        <h1 className="mt-1 text-2xl font-bold">Student Responses</h1>
        <p className="mt-2 text-sm text-slate-300">Review submitted writing/content work, give feedback, and record the grade in the gradebook.</p>
      </header>
      <section className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_auto]">
        <label className="text-sm font-medium text-slate-700">Search responses
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Student name, email or response text" className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-medium text-slate-700">Review status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal">
            <option value="all">All responses</option><option value="submitted">Submitted</option><option value="awaiting">Awaiting submission</option><option value="graded">Already graded</option>
          </select>
        </label>
        <p className="text-xs text-slate-500 sm:col-span-2" aria-live="polite">Showing {items.length} of {allItems.length} responses.</p>
        {(search || statusFilter !== "all") && <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }} className="justify-self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold sm:col-span-2">Clear filters</button>}
      </section>
      {!allItems.length ? <Message text="No student responses have been submitted for this assignment yet." /> : !items.length ? <Message text="No responses match these filters." /> : (
        <section className="space-y-4">
          {items.map((r) => {
            const d = drafts[r.id] ?? {
              score: r.score === null ? "" : String(r.score),
              maxScore: r.maxScore === null ? "" : String(r.maxScore),
              feedback: r.teacherFeedback ?? "",
            };
            const set = (patch: Partial<GradeDraft>) => {
              setSavedResponseIds((current) => current.filter((id) => id !== r.id));
              setDrafts((current) => ({ ...current, [r.id]: { ...d, ...patch } }));
            };
            const numericScore = Number(d.score);
            const numericMaxScore = Number(d.maxScore);
            const scorePresent = d.score.trim() !== "";
            const maxScorePresent = d.maxScore.trim() !== "";
            const numbersValid = scorePresent && maxScorePresent && Number.isFinite(numericScore) && Number.isFinite(numericMaxScore) && numericScore >= 0 && numericMaxScore > 0 && numericScore <= numericMaxScore;
            const valid = r.status === "submitted" && numbersValid;
            const validationMessage = r.status !== "submitted"
              ? "This response must be submitted by the student before it can be graded."
              : !scorePresent || !maxScorePresent
                ? "Enter both the score and maximum score to enable saving."
                : !numbersValid
                  ? "Check the scores: the score must be 0 or higher and cannot exceed the maximum score."
                  : null;
            const isSavingThisResponse = grade.isPending && grade.variables?.responseId === r.id;
            const saveError = grade.isError && grade.variables?.responseId === r.id;
            return (
              <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">{r.studentName}</h2>
                    <p className="text-xs text-slate-500">{r.studentEmail ?? r.studentUserId}{r.submittedAt ? " · Submitted " + new Date(r.submittedAt).toLocaleString() : ""}</p>
                  </div>
                  {r.status === "submitted"
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Submitted</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Draft · Awaiting submission</span>}
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Student response</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{r.responseText || "No response text."}</p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-[120px_120px_1fr]">
                  <label className="text-sm font-medium text-slate-700">Score<input type="number" min="0" step="0.01" value={d.score} onChange={(e) => set({ score: e.target.value })} className="input mt-1 w-full" /></label>
                  <label className="text-sm font-medium text-slate-700">Max score<input type="number" min="0.01" step="0.01" value={d.maxScore} onChange={(e) => set({ maxScore: e.target.value })} className="input mt-1 w-full" /></label>
                  <label className="text-sm font-medium text-slate-700">Teacher feedback<textarea value={d.feedback} onChange={(e) => set({ feedback: e.target.value })} className="input mt-1 min-h-24 w-full resize-y" /></label>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{r.score !== null && r.maxScore !== null ? "Recorded: " + r.score + "/" + r.maxScore : "Not graded yet"}</span>
                  <button type="button" disabled={!valid || grade.isPending} onClick={() => grade.mutate({ responseId: r.id, score: numericScore, maxScore: numericMaxScore, feedback: d.feedback })} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                    <Save size={16} />{isSavingThisResponse ? "Saving..." : "Save Grade & Feedback"}
                  </button>
                </div>
                {validationMessage && <p className="mt-2 text-xs text-amber-700">{validationMessage}</p>}
                {savedResponseIds.includes(r.id) && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">Grade and feedback saved successfully.</p>}
                {saveError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{grade.error instanceof Error ? grade.error.message : "Could not save the grade. Please try again."}</p>}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}
