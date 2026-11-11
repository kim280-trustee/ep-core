import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Save, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "@/core/i18n/useTranslation";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningContentService } from "@/features/learning-content";

type GradeDraft = { score: string; maxScore: string; feedback: string };

export default function TeacherContentResponsesPage() {
  const { assignmentId = "" } = useParams();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});
  const [savedResponseIds, setSavedResponseIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "awaiting" | "graded">("all");
  const [markingCriteria, setMarkingCriteria] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const responses = useQuery({
    queryKey: ["learning", "teacher-content-responses", assignmentId],
    queryFn: () => learningContentService.listTeacherResponses(assignmentId),
    enabled: Boolean(assignmentId),
  });
  const suggestMarking = useMutation({
    mutationFn: async (input: { responseId: string; organizationId: string; studentResponse: string; markingCriteria: string; maxMarks: number }) => {
      const { data, error } = await supabase.functions.invoke("generate-teaching-material", {
        body: {
          organizationId: input.organizationId,
          subject: "Written response",
          gradeLevel: "Teacher supplied grade context",
          topic: "Student written response",
          objective: "Assess the response only against the supplied marking criteria. Suggest a mark and constructive feedback for teacher review.",
          format: "marking_feedback",
          language: language === "th" ? "Thai" : "English",
          difficulty: "developing",
          country: "", educationSystem: "", curriculumReference: "", durationMinutes: 50,
          priorKnowledge: "", availableMaterials: "", teacherNeeds: "",
          studentResponse: input.studentResponse,
          markingCriteria: input.markingCriteria,
          maxMarks: input.maxMarks,
        },
      });
      if (error) {
        const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
        const details = await context?.json?.().catch(() => null);
        throw new Error(details?.error || error.message || "AI marking suggestion failed.");
      }
      if (!data || typeof data.draft !== "string" || !data.draft.trim()) throw new Error("The AI service returned no marking suggestion.");
      return { responseId: input.responseId, draft: data.draft as string };
    },
    onSuccess: (result) => setAiSuggestions((current) => ({ ...current, [result.responseId]: result.draft })),
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

  if (!assignmentId) return <Message text={t("contentResponses.noAssignment")} />;
  if (responses.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (responses.isError) return <Message text={responses.error instanceof Error ? responses.error.message : t("contentResponses.loadError")} />;

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
      <Link to="/teacher" className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16} />{t("contentResponses.teacherDashboard")}</Link>
      <header className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">{t("contentResponses.teacherAssessment")}</p>
        <h1 className="mt-1 text-2xl font-bold">{t("contentResponses.title")}</h1>
        <p className="mt-2 text-sm text-slate-300">{t("contentResponses.intro")}</p>
      </header>
      <section className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_auto]">
        <label className="text-sm font-medium text-slate-700">{t("contentResponses.search")}
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("contentResponses.searchPlaceholder")} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-medium text-slate-700">{t("contentResponses.reviewStatus")}
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal">
            <option value="all">{t("contentResponses.allResponses")}</option><option value="submitted">{t("contentResponses.submitted")}</option><option value="awaiting">{t("contentResponses.awaiting")}</option><option value="graded">{t("contentResponses.alreadyGraded")}</option>
          </select>
        </label>
        <p className="text-xs text-slate-500 sm:col-span-2" aria-live="polite">{t("contentResponses.showing")} {items.length} / {allItems.length}</p>
        {(search || statusFilter !== "all") && <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }} className="justify-self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold sm:col-span-2">{t("contentResponses.clearFilters")}</button>}
      </section>
      {!allItems.length ? <Message text={t("contentResponses.noResponses")} /> : !items.length ? <Message text={t("contentResponses.noMatches")} /> : (
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
              ? t("contentResponses.mustSubmit")
              : !scorePresent || !maxScorePresent
                ? t("contentResponses.enterScores")
                : !numbersValid
                  ? t("contentResponses.invalidScores")
                  : null;
            const isSavingThisResponse = grade.isPending && grade.variables?.responseId === r.id;
            const saveError = grade.isError && grade.variables?.responseId === r.id;
            return (
              <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">{r.studentName}</h2>
                    <p className="text-xs text-slate-500">{r.studentEmail ?? r.studentUserId}{r.submittedAt ? " · " + t("contentResponses.submittedAt") + " " + new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(r.submittedAt)) : ""}</p>
                  </div>
                  {r.status === "submitted"
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />{t("contentResponses.submitted")}</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{t("contentResponses.draftAwaiting")}</span>}
                </div>
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("contentResponses.studentResponse")}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">{r.responseText || t("contentResponses.noResponseText")}</p>
                </div>
                <section className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-slate-900">AI marking assistant / ผู้ช่วยตรวจคำตอบ</h3><p className="mt-1 text-xs text-slate-600">Get a suggested mark and feedback. The teacher must make the final grading decision.</p></div><button type="button" disabled={r.status !== "submitted" || !r.responseText.trim() || suggestMarking.isPending} onClick={() => { setAiSuggestions((current) => { const next = { ...current }; delete next[r.id]; return next; }); suggestMarking.mutate({ responseId: r.id, organizationId: r.organizationId, studentResponse: r.responseText, markingCriteria: markingCriteria[r.id] ?? "", maxMarks: numbersValid ? numericMaxScore : 10 }); }} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Sparkles size={14} />{suggestMarking.isPending && suggestMarking.variables?.responseId === r.id ? "Preparing suggestion..." : "Suggest marks & feedback"}</button></div><label className="mt-3 block text-xs font-medium text-slate-700">Marking criteria / rubric (optional)<textarea value={markingCriteria[r.id] ?? ""} onChange={(event) => setMarkingCriteria((current) => ({ ...current, [r.id]: event.target.value }))} maxLength={2000} rows={2} placeholder="Paste the rubric or explain what a good answer should include." className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" /></label><p className="mt-2 text-xs text-amber-800">Remove student names and personal details before using AI. The suggestion is not saved as a grade.</p>{aiSuggestions[r.id] && <div className="mt-3 rounded-lg border border-indigo-200 bg-white p-3"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">AI suggestion — teacher review required</p><pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">{aiSuggestions[r.id]}</pre><button type="button" onClick={() => set({ feedback: aiSuggestions[r.id] })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Use suggested feedback as a draft</button></div>}{suggestMarking.isError && suggestMarking.variables?.responseId === r.id && <p role="alert" className="mt-2 text-xs text-red-700">{suggestMarking.error instanceof Error ? suggestMarking.error.message : "AI suggestion could not be generated."}</p>}</section>
                <div className="mt-5 grid gap-4 md:grid-cols-[120px_120px_1fr]">
                  <label className="text-sm font-medium text-slate-700">{t("contentResponses.score")}<input type="number" min="0" step="0.01" value={d.score} onChange={(e) => set({ score: e.target.value })} className="input mt-1 w-full" /></label>
                  <label className="text-sm font-medium text-slate-700">{t("contentResponses.maxScore")}<input type="number" min="0.01" step="0.01" value={d.maxScore} onChange={(e) => set({ maxScore: e.target.value })} className="input mt-1 w-full" /></label>
                  <label className="text-sm font-medium text-slate-700">{t("contentResponses.teacherFeedback")}<textarea value={d.feedback} onChange={(e) => set({ feedback: e.target.value })} className="input mt-1 min-h-24 w-full resize-y" /></label>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{r.score !== null && r.maxScore !== null ? t("contentResponses.recorded") + ": " + r.score + "/" + r.maxScore : t("contentResponses.notGraded")}</span>
                  <button type="button" disabled={!valid || grade.isPending} onClick={() => grade.mutate({ responseId: r.id, score: numericScore, maxScore: numericMaxScore, feedback: d.feedback })} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                    <Save size={16} />{isSavingThisResponse ? t("contentResponses.saving") : t("contentResponses.saveGrade")}
                  </button>
                </div>
                {validationMessage && <p className="mt-2 text-xs text-amber-700">{validationMessage}</p>}
                {savedResponseIds.includes(r.id) && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">{t("contentResponses.saved")}</p>}
                {saveError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{grade.error instanceof Error ? grade.error.message : t("contentResponses.saveError")}</p>}
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
