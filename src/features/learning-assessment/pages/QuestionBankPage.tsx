import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileQuestion, Plus, Search, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import { learningAssessmentService } from "../services/learning-assessment.service";
import type { LearningQuestionType } from "../types/learning-assessment.types";

type Choice = { key: string; label: string };
type TeacherQuestionType = Extract<LearningQuestionType, "single_choice" | "true_false" | "short_answer">;

const teacherTypes: Array<{ value: TeacherQuestionType; label: string }> = [
  { value: "single_choice", label: "Single choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short answer" },
];

export default function QuestionBankPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [questionType, setQuestionType] = useState<TeacherQuestionType>("single_choice");
  const [objectiveId, setObjectiveId] = useState("");
  const [explanation, setExplanation] = useState("");
  const [correctOption, setCorrectOption] = useState("a");
  const [shortAnswer, setShortAnswer] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { key: "a", label: "" }, { key: "b", label: "" }, { key: "c", label: "" }, { key: "d", label: "" },
  ]);
  const [message, setMessage] = useState<string | null>(null);

  const classes = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  useEffect(() => {
    if (!classGroupId && classes.data?.length) setClassGroupId(classes.data[0].classGroup.id);
  }, [classGroupId, classes.data]);

  const selectedClass = classes.data?.find((x) => x.classGroup.id === classGroupId);
  const organizationId = selectedClass?.membership.organizationId;

  const questions = useQuery({
    queryKey: ["learning", "question-bank", "questions", organizationId],
    queryFn: () => learningAssessmentService.listQuestions(organizationId),
    enabled: Boolean(organizationId),
  });
  const objectives = useQuery({
    queryKey: ["learning", "question-bank", "objectives"],
    queryFn: () => learningContentService.listObjectives(),
    enabled: Boolean(user),
  });

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (questions.data ?? []).filter((question) => {
      const matchesSearch = !term || question.code.toLowerCase().includes(term) || question.questionType.toLowerCase().includes(term);
      return matchesSearch && (!typeFilter || question.questionType === typeFilter) && (!statusFilter || question.status === statusFilter);
    });
  }, [questions.data, search, typeFilter, statusFilter]);

  const resetForm = () => {
    setEditingQuestionId(null); setCode(""); setPrompt(""); setQuestionType("single_choice");
    setObjectiveId(""); setExplanation(""); setCorrectOption("a"); setShortAnswer("");
    setChoices([{ key: "a", label: "" }, { key: "b", label: "" }, { key: "c", label: "" }, { key: "d", label: "" }]);
  };

  const prepareNewVersion = useMutation({
    mutationFn: async (questionId: string) => {
      const question = await learningAssessmentService.getQuestion(questionId);
      const versions = await learningAssessmentService.listQuestionVersions(questionId);
      const latest = versions[0];
      if (!latest) throw new Error("The question has no version.");
      const mappedType = teacherTypes.some((item) => item.value === question.questionType)
        ? question.questionType as TeacherQuestionType
        : "short_answer";
      setEditingQuestionId(questionId);
      setCode(question.code);
      setPrompt(typeof latest.prompt.text === "string" ? latest.prompt.text : "");
      setQuestionType(mappedType);
      setExplanation(typeof latest.explanation?.text === "string" ? latest.explanation.text : "");
      const raw = latest.configuration.options;
      if (Array.isArray(raw)) {
        const mapped = raw.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const row = item as Record<string, unknown>;
          return typeof row.key === "string" && typeof row.label === "string" ? [{ key: row.key, label: row.label }] : [];
        });
        if (mapped.length) setChoices(mapped);
      }
      setCorrectOption("");
      setShortAnswer("");
      setMessage("New version prepared. Re-enter the correct answer because answer keys are intentionally write-only.");
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !organizationId) throw new Error("Select a teacher class first.");
      if (!code.trim() || !prompt.trim() || !objectiveId) throw new Error("Code, prompt, and learning objective are required.");
      if (questionType === "single_choice" && choices.some((choice) => !choice.label.trim())) throw new Error("Complete every answer option.");
      if ((questionType === "single_choice" || questionType === "true_false") && !correctOption) throw new Error("Select the correct answer.");
      if (questionType === "short_answer" && !shortAnswer.trim()) throw new Error("Enter the expected answer for teacher reference.");

      let questionId = editingQuestionId;
      let versionNo = 1;
      if (!questionId) {
        const question = await learningAssessmentService.createQuestion({
          organizationId, code: code.trim().toUpperCase(), questionType, createdBy: user.id,
        });
        questionId = question.id;
      } else {
        const versions = await learningAssessmentService.listQuestionVersions(questionId);
        versionNo = (versions[0]?.versionNo ?? 0) + 1;
      }

      const configuration = questionType === "single_choice"
        ? { options: choices.map((choice) => ({ key: choice.key, label: choice.label.trim() })) }
        : questionType === "true_false"
          ? { options: [{ key: "true", label: "True" }, { key: "false", label: "False" }] }
          : { response_mode: "manual_review" };

      const version = await learningAssessmentService.createQuestionVersion({
        questionId, versionNo, prompt: { text: prompt.trim() }, configuration,
        explanation: explanation.trim() ? { text: explanation.trim() } : null, createdBy: user.id,
      });

      await learningAssessmentService.saveQuestionEvaluationKey({
        questionVersionId: version.id,
        evaluationKey: questionType === "short_answer" ? { expected_answer: shortAnswer.trim() } : { correct_option_id: correctOption },
        scoringRules: questionType === "short_answer" ? { method: "manual_review" } : { method: "exact_option" },
      });
      await learningAssessmentService.addQuestionObjective({ questionVersionId: version.id, objectiveId, weight: 1 });
      return Boolean(editingQuestionId);
    },
    onSuccess: async (wasVersion) => {
      setMessage(wasVersion ? "New question version saved as draft." : "Question saved as draft.");
      resetForm();
      await qc.invalidateQueries({ queryKey: ["learning", "question-bank"] });
      await qc.invalidateQueries({ queryKey: ["learning", "authoring", "questions"] });
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => learningAssessmentService.publishQuestion(id, user!.id),
    onSuccess: async () => {
      setMessage("Question published.");
      await qc.invalidateQueries({ queryKey: ["learning", "question-bank"] });
      await qc.invalidateQueries({ queryKey: ["learning", "authoring", "questions"] });
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const updateChoice = (index: number, label: string) => setChoices((current) => current.map((choice, i) => i === index ? { ...choice, label } : choice));
  const addChoice = () => setChoices((current) => [...current, { key: String.fromCharCode(97 + current.length), label: "" }]);
  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;
    const removed = choices[index];
    setChoices((current) => current.filter((_, i) => i !== index));
    if (removed?.key === correctOption) setCorrectOption("");
  };

  if (!user) return <Panel title="Question Bank"><p>Sign in to continue.</p></Panel>;
  if (classes.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError) return <Panel title="Question Bank"><p>Teacher classes could not be loaded.</p></Panel>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/teacher" className="text-sm text-slate-500 hover:text-slate-900">Back to teacher workspace</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="mt-1 text-sm text-slate-500">Create reusable, versioned questions with secure answer keys.</p>
        </div>
        <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"><Plus size={16} /> New question</button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block max-w-xl space-y-2">
          <span className="text-sm font-medium text-slate-700">Teacher class</span>
          <select value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">Select a class</option>
            {classes.data?.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>)}
          </select>
        </label>
      </section>

      {message && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-slate-900"><FileQuestion size={18} /> Question library</h2><p className="mt-1 text-xs text-slate-500">Find a question or prepare a new version.</p></div><span className="text-xs text-slate-500">{filteredQuestions.length} shown</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm" placeholder="Search code or type" /></label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">All types</option>{teacherTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">All status</option><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option><option value="retired">Retired</option></select>
          </div>
          <div className="mt-4 space-y-2">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{question.code}</p><p className="text-xs text-slate-500">{question.questionType} · {question.status}</p></div><span className="text-xs text-slate-400">{question.languageCode}</span></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.status !== "published" && <button type="button" onClick={() => publishMutation.mutate(question.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Publish</button>}
                  <button type="button" onClick={() => prepareNewVersion.mutate(question.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">New version</button>
                </div>
              </div>
            ))}
            {!filteredQuestions.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No questions match the current filters.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">{editingQuestionId ? "Create new version" : "Create question"}</h2>{editingQuestionId && <button type="button" onClick={resetForm} className="text-slate-400"><X size={18} /></button>}</div>
          <div className="mt-5 space-y-4">
            <Field label="Question code"><input disabled={Boolean(editingQuestionId)} value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="ENG-M1-Q001" /></Field>
            <Field label="Question type"><select disabled={Boolean(editingQuestionId)} value={questionType} onChange={(e) => { const next = e.target.value as TeacherQuestionType; setQuestionType(next); setCorrectOption(next === "single_choice" ? "a" : ""); }} className="input">{teacherTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></Field>
            <Field label="Prompt"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="input" placeholder="Write the learner-facing question..." /></Field>

            {questionType === "single_choice" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><div><span className="text-sm font-medium text-slate-700">Answer options</span><p className="mt-0.5 text-xs text-slate-500">Choose the correct answer using the radio button.</p></div><button type="button" onClick={addChoice} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Plus size={14} /> Add option</button></div>
                {choices.map((choice, index) => <div key={choice.key} className="flex items-center gap-2"><input type="radio" name="correct-option" checked={correctOption === choice.key} onChange={() => setCorrectOption(choice.key)} /><span className="w-5 text-sm font-semibold">{choice.key.toUpperCase()}</span><input value={choice.label} onChange={(e) => updateChoice(index, e.target.value)} className="input flex-1" placeholder="Answer option" /><button type="button" onClick={() => removeChoice(index)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><X size={16} /></button></div>)}
                
              </div>
            )}

            {questionType === "true_false" && <Field label="Correct answer"><select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)} className="input"><option value="">Select correct answer</option><option value="true">True</option><option value="false">False</option></select></Field>}

            {questionType === "short_answer" && <Field label="Expected answer"><input value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} className="input" placeholder="Teacher reference answer" /><p className="mt-1 text-xs text-slate-500">Short-answer questions are stored for manual review in this batch.</p></Field>}

            <Field label="Learning objective"><select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)} className="input"><option value="">Select objective</option>{objectives.data?.map((objective) => <option key={objective.id} value={objective.id}>{objective.code} — {objective.name}</option>)}</select></Field>
            <Field label="Explanation (optional)"><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} className="input" placeholder="Explain the answer after submission..." /></Field>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Save as a draft, then publish when it is ready.</p><button type="button" disabled={!organizationId || createMutation.isPending} onClick={() => createMutation.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"><Sparkles size={16} />{createMutation.isPending ? "Saving..." : editingQuestionId ? "Save new version" : "Save draft"}</button></div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="flex items-start gap-3"><Send size={18} className="mt-0.5" /><div><p className="font-semibold">Publishing workflow</p><p className="mt-1 text-sm text-slate-300">A question needs a version, objective mapping, and reviewer before publication. Evaluation keys are stored in the database and are not readable from the browser.</p></div></div>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{title}</h2><div className="mt-3">{children}</div></section>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
