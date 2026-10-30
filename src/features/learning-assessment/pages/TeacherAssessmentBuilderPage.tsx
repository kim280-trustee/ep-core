import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, ClipboardCheck, FileQuestion, Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssessmentService } from "../services/learning-assessment.service";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import type { LearningAssessmentType } from "../types/learning-assessment.types";

const assessmentTypes: Array<{ value: LearningAssessmentType; label: string }> = [
  { value: "diagnostic", label: "Diagnostic" },
  { value: "practice", label: "Practice" },
  { value: "assignment", label: "Assignment" },
  { value: "quiz", label: "Quiz" },
  { value: "test", label: "Test" },
  { value: "mock_exam", label: "Mock exam" },
  { value: "competition", label: "Competition" },
];

type PublishedQuestionOption = {
  id: string;
  code: string;
  type: "single_choice" | "true_false";
  prompt: string;
  versionId: string;
};

export default function TeacherAssessmentBuilderPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [assessmentCode, setAssessmentCode] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [assessmentType, setAssessmentType] = useState<LearningAssessmentType>("diagnostic");
  const [activeAssessmentId, setActiveAssessmentId] = useState("");
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<"all" | "single_choice" | "true_false">("all");
  const [message, setMessage] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const activeClassGroupId = classGroupId || classesQuery.data?.[0]?.classGroup.id || "";
  const selectedClass = classesQuery.data?.find((item) => item.classGroup.id === activeClassGroupId);
  const organizationId = selectedClass?.membership.organizationId;

  const assessmentsQuery = useQuery({
    queryKey: ["learning", "assessment-builder", "assessments", organizationId],
    queryFn: () => learningAssessmentService.listAssessments(organizationId),
    enabled: Boolean(organizationId),
  });
  const questionsQuery = useQuery({
    queryKey: ["learning", "assessment-builder", "questions", organizationId],
    queryFn: async (): Promise<PublishedQuestionOption[]> => {
      const questions = await learningAssessmentService.listQuestions(organizationId);
      const eligible = questions.filter(
        (question) =>
          question.status === "published" &&
          (question.questionType === "single_choice" || question.questionType === "true_false"),
      );
      const options = await Promise.all(
        eligible.map(async (question) => {
          const versions = await learningAssessmentService.listQuestionVersions(question.id);
          const version = versions.find((candidate) => candidate.publishedAt !== null);
          if (!version) return null;
          return {
            id: question.id,
            code: question.code,
            type: question.questionType as "single_choice" | "true_false",
            prompt: typeof version.prompt.text === "string" ? version.prompt.text : question.code,
            versionId: version.id,
          } satisfies PublishedQuestionOption;
        }),
      );
      return options.filter((option): option is PublishedQuestionOption => option !== null);
    },
    enabled: Boolean(organizationId),
  });
  const activeAssessment = assessmentsQuery.data?.find((assessment) => assessment.id === activeAssessmentId);
  const activeAssessmentQuestionsQuery = useQuery({
    queryKey: ["learning", "assessment-builder", "assessment-questions", activeAssessmentId],
    queryFn: () => learningAssessmentService.listAssessmentQuestions(activeAssessmentId),
    enabled: Boolean(activeAssessmentId),
  });

  const selectedQuestionOptions = useMemo(
    () => (questionsQuery.data ?? []).filter((question) => selectedVersionIds.includes(question.versionId)),
    [questionsQuery.data, selectedVersionIds],
  );
  const existingVersionIds = new Set((activeAssessmentQuestionsQuery.data ?? []).map((item) => item.questionVersionId));
  const pendingQuestionOptions = selectedQuestionOptions.filter((question) => !existingVersionIds.has(question.versionId));
  const normalizedQuestionSearch = questionSearch.trim().toLocaleLowerCase();
  const visibleQuestionOptions = (questionsQuery.data ?? []).filter((question) => {
    const matchesSearch = !normalizedQuestionSearch || [question.code, question.prompt].some((value) => value.toLocaleLowerCase().includes(normalizedQuestionSearch));
    return matchesSearch && (questionTypeFilter === "all" || question.type === questionTypeFilter);
  });
  const draftAssessments = (assessmentsQuery.data ?? []).filter((assessment) => assessment.status !== "published");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user || !organizationId) throw new Error("Select a teacher class first.");
      const normalizedCode = assessmentCode.trim().toUpperCase();
      if (!normalizedCode || !assessmentTitle.trim()) throw new Error("Assessment code and title are required.");
      if ((assessmentsQuery.data ?? []).some((item) => item.code.toUpperCase() === normalizedCode)) {
        throw new Error("That assessment code already exists in this organization. Choose another code.");
      }
      return learningAssessmentService.createAssessment({
        organizationId,
        code: normalizedCode,
        title: assessmentTitle.trim(),
        description: assessmentDescription.trim() || null,
        assessmentType,
        languageCode: "en",
        createdBy: user.id,
      });
    },
    onSuccess: async (assessment) => {
      setActiveAssessmentId(assessment.id);
      setAssessmentCode("");
      setAssessmentTitle("");
      setAssessmentDescription("");
      setSelectedVersionIds([]);
      setMessage({ kind: "success", text: "Draft assessment created. Select published questions below and add them to this draft." });
      await queryClient.invalidateQueries({ queryKey: ["learning", "assessment-builder", "assessments"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "authoring", "assessments"] });
    },
    onError: (error: Error) => setMessage({ kind: "error", text: error.message }),
  });

  const addQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (!activeAssessment || activeAssessment.status === "published") {
        throw new Error("Choose an unpublished draft assessment before adding questions.");
      }
      if (!pendingQuestionOptions.length) {
        throw new Error("Select at least one published question that is not already attached.");
      }
      const currentItems = await learningAssessmentService.listAssessmentQuestions(activeAssessment.id);
      const currentIds = new Set(currentItems.map((item) => item.questionVersionId));
      let sequenceNo = currentItems.reduce((max, item) => Math.max(max, item.sequenceNo), 0) + 1;
      let added = 0;
      for (const question of pendingQuestionOptions) {
        if (currentIds.has(question.versionId)) continue;
        await learningAssessmentService.addAssessmentQuestion({
          assessmentId: activeAssessment.id,
          questionVersionId: question.versionId,
          sequenceNo,
          points: 1,
          required: true,
        });
        currentIds.add(question.versionId);
        sequenceNo += 1;
        added += 1;
      }
      return added;
    },
    onSuccess: async (added) => {
      setMessage({ kind: "success", text: added ? `Added ${added} question(s). Each question is worth 1 point; publish when the draft is ready.` : "Those questions are already attached to this assessment." });
      await queryClient.invalidateQueries({ queryKey: ["learning", "assessment-builder", "assessment-questions", activeAssessmentId] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "assessment-builder", "assessments"] });
    },
    onError: (error: Error) => {
      setMessage({ kind: "error", text: `Questions could not all be added. The draft is preserved; select the same questions and retry safely. ${error.message}` });
      void queryClient.invalidateQueries({ queryKey: ["learning", "assessment-builder", "assessment-questions", activeAssessmentId] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!activeAssessment || activeAssessment.status === "published") throw new Error("Choose an unpublished draft assessment.");
      const items = await learningAssessmentService.listAssessmentQuestions(activeAssessment.id);
      if (!items.length) throw new Error("Add at least one question before publishing.");
      return learningAssessmentService.publishAssessment(activeAssessment.id, user!.id);
    },
    onSuccess: async () => {
      setMessage({ kind: "success", text: "Assessment published. It can now be attached to an assignment." });
      await queryClient.invalidateQueries({ queryKey: ["learning", "assessment-builder", "assessments"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "authoring", "assessments"] });
    },
    onError: (error: Error) => setMessage({ kind: "error", text: error.message }),
  });

  if (!user) return <Panel title="Assessment builder"><p>Sign in to continue.</p></Panel>;
  if (classesQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classesQuery.isError) return <Panel title="Assessment builder"><p>Your teacher classes could not be loaded. Refresh and try again.</p></Panel>;
  if (!classesQuery.data?.length) return <Panel title="Assessment builder"><p>No active teacher classes are assigned to this account yet.</p></Panel>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Link to="/teacher" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to teacher workspace</Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="rounded-2xl bg-indigo-100 p-3 text-indigo-700"><ClipboardCheck size={24} /></span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assessment builder</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Build reusable multi-question assessments for diagnostics, practice, quizzes, tests, mock exams, and competitions. Only published questions with supported auto-scoring types are available here.</p>
          </div>
        </div>
      </header>

      {message && (
        <div role={message.kind === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${message.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : message.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}>
          {message.kind === "error" ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Assessment context</h2>
        <label className="mt-3 block max-w-xl space-y-2">
          <span className="text-sm font-medium text-slate-700">Teacher class / organization</span>
          <select value={activeClassGroupId} onChange={(event) => { setClassGroupId(event.target.value); setActiveAssessmentId(""); setSelectedVersionIds([]); setMessage(null); }} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
            {classesQuery.data.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>)}
          </select>
        </label>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">1. Create a draft</h2>
            <p className="mt-1 text-sm text-slate-500">Diagnostic assessments can establish a baseline before a learning unit.</p>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); setMessage(null); createMutation.mutate(); }} className="space-y-4">
            <Field label="Assessment code"><input required value={assessmentCode} onChange={(event) => setAssessmentCode(event.target.value)} className="input" placeholder="ENG-M1-DIAG-001" /></Field>
            <Field label="Title"><input required value={assessmentTitle} onChange={(event) => setAssessmentTitle(event.target.value)} className="input" placeholder="Present simple diagnostic" /></Field>
            <Field label="Assessment type"><select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as LearningAssessmentType)} className="input">{assessmentTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
            <Field label="Instructions / description"><textarea value={assessmentDescription} onChange={(event) => setAssessmentDescription(event.target.value)} rows={3} className="input" placeholder="Optional instructions for teachers and students" /></Field>
            <button type="submit" disabled={createMutation.isPending || !organizationId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <Plus size={16} />{createMutation.isPending ? "Creating…" : "Create draft assessment"}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900">Continue an existing draft</h3>
            {assessmentsQuery.isError ? <p className="mt-2 text-sm text-red-700">Assessments could not be loaded.</p> : (
              <div className="mt-3 space-y-2">
                {draftAssessments.map((assessment) => (
                  <div key={assessment.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${assessment.id === activeAssessmentId ? "border-indigo-300 bg-indigo-50" : "border-slate-200"}`}>
                    <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{assessment.title}</p><p className="text-xs text-slate-500">{assessment.code} · {assessment.assessmentType}</p></div>
                    <button type="button" onClick={() => { setActiveAssessmentId(assessment.id); setSelectedVersionIds([]); setMessage({ kind: "info", text: `Editing draft: ${assessment.title}` }); }} className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">Continue</button>
                  </div>
                ))}
                {!draftAssessments.length && <p className="text-sm text-slate-500">No draft assessments yet.</p>}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">2. Add questions</h2>
            <p className="mt-1 text-sm text-slate-500">Select published single-choice or true/false questions. Each added question is worth 1 point.</p>
          </div>
          {activeAssessment ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Active draft</p>
              <p className="mt-1 font-semibold text-slate-900">{activeAssessment.title}</p>
              <p className="text-sm text-slate-600">{activeAssessment.code} · {activeAssessment.assessmentType}</p>
              {activeAssessment.status === "published" && <p className="mt-1 text-sm font-semibold text-emerald-700">Published — read-only</p>}
            </div>
          ) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Create a draft or choose an existing draft to start adding questions.</p>}

          {questionsQuery.isPending ? <div className="h-32 animate-pulse rounded-xl bg-slate-100" /> : questionsQuery.isError ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">Published questions could not be loaded.</p>
          ) : (
            <>
              <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="text-sm font-medium text-slate-700">Search published questions
                  <input type="search" value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Question code or prompt" className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
                </label>
                <label className="text-sm font-medium text-slate-700">Question type
                  <select value={questionTypeFilter} onChange={(event) => setQuestionTypeFilter(event.target.value as typeof questionTypeFilter)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal"><option value="all">All supported types</option><option value="single_choice">Single choice</option><option value="true_false">True / False</option></select>
                </label>
                <p className="text-xs text-slate-500 sm:col-span-2" aria-live="polite">Showing {visibleQuestionOptions.length} of {questionsQuery.data?.length ?? 0} questions · {selectedVersionIds.length} selected · {pendingQuestionOptions.length} ready to add</p>
                {(questionSearch || questionTypeFilter !== "all" || selectedVersionIds.length > 0) && <div className="flex flex-wrap gap-2 sm:col-span-2"><button type="button" onClick={() => { setQuestionSearch(""); setQuestionTypeFilter("all"); }} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">Clear filters</button>{selectedVersionIds.length > 0 && <button type="button" onClick={() => setSelectedVersionIds([])} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">Clear selection</button>}</div>}
              </div>
              <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {visibleQuestionOptions.map((question) => {
                const checked = selectedVersionIds.includes(question.versionId);
                const attached = existingVersionIds.has(question.versionId);
                return (
                  <label key={question.versionId} className={`flex gap-3 rounded-xl border p-3 ${attached ? "border-emerald-200 bg-emerald-50/60" : checked ? "border-indigo-300 bg-indigo-50/60" : "border-slate-200"}`}>
                    <input type="checkbox" checked={checked} disabled={!activeAssessment || activeAssessment.status === "published" || attached} onChange={(event) => setSelectedVersionIds((current) => event.target.checked ? [...current, question.versionId] : current.filter((id) => id !== question.versionId))} className="mt-1 size-4 accent-indigo-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-500">{question.code} · {question.type}{attached ? " · Already attached" : ""}</span>
                      <span className="mt-1 block text-sm font-medium text-slate-900">{question.prompt}</span>
                    </span>
                  </label>
                );
              })}
              {!questionsQuery.data?.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No published auto-scored questions are available. Create and publish questions in the <Link className="font-semibold underline" to="/teacher/question-bank">Question Bank</Link> first.</p>}
              {Boolean(questionsQuery.data?.length) && !visibleQuestionOptions.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No questions match these filters.</p>}
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
            <button type="button" onClick={() => addQuestionsMutation.mutate()} disabled={!activeAssessment || activeAssessment.status === "published" || !pendingQuestionOptions.length || addQuestionsMutation.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <Plus size={16} />{addQuestionsMutation.isPending ? "Adding…" : `Add selected (${pendingQuestionOptions.length})`}
            </button>
            <button type="button" onClick={() => publishMutation.mutate()} disabled={!activeAssessment || activeAssessment.status === "published" || !(activeAssessmentQuestionsQuery.data?.length) || publishMutation.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 disabled:opacity-50">
              <Send size={16} />{publishMutation.isPending ? "Publishing…" : "Publish assessment"}
            </button>
          </div>
          {activeAssessment && (
            <div className="rounded-xl border border-slate-200 p-3">
              <h3 className="font-semibold text-slate-900">Attached questions ({activeAssessmentQuestionsQuery.data?.length ?? 0})</h3>
              {activeAssessmentQuestionsQuery.isPending ? <p className="mt-2 text-sm text-slate-500">Loading attached questions…</p> : (
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                  {(activeAssessmentQuestionsQuery.data ?? []).map((item) => <li key={item.id}>Question {item.sequenceNo} · {item.points} point(s)</li>)}
                </ol>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3"><FileQuestion size={20} className="text-slate-500" /><div><h2 className="font-semibold text-slate-900">Next: assign the assessment</h2><p className="mt-1 text-sm text-slate-500">After publishing, open Teacher Authoring to attach this assessment to a class assignment.</p></div></div>
        <Link to="/teacher/authoring" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800"><ClipboardCheck size={16} />Open Teacher Authoring</Link>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h1 className="text-xl font-bold text-slate-900">{title}</h1><div className="mt-3 text-sm text-slate-600">{children}</div></section>;
}
