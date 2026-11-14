import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileQuestion, Plus, Search, Send, Sparkles, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import { learningAssessmentService } from "../services/learning-assessment.service";
import type { LearningQuestionType } from "../types/learning-assessment.types";

type Choice = { key: string; label: string };
type TeacherQuestionType = Extract<LearningQuestionType, "single_choice" | "true_false" | "short_answer">;

const teacherTypes: TeacherQuestionType[] = ["single_choice", "true_false", "short_answer"];

export default function QuestionBankPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const questionTypeLabel = (value: string) => value === "single_choice"
    ? t("questionBank.single")
    : value === "true_false"
      ? t("questionBank.trueFalse")
      : value === "short_answer"
        ? t("questionBank.short")
        : value;
  const questionStatusLabel = (value: string) => value === "draft"
    ? t("questionBank.statusDraft")
    : value === "review"
      ? t("questionBank.statusReview")
      : value === "published"
        ? t("questionBank.statusPublished")
        : value === "retired"
          ? t("questionBank.statusRetired")
          : value;
  const [classGroupId, setClassGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
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
  const activeClassGroupId = classGroupId || classes.data?.[0]?.classGroup.id || "";
  const selectedClass = classes.data?.find((x) => x.classGroup.id === activeClassGroupId);
  const organizationId = selectedClass?.membership.organizationId;
  const selectedSubjectId = subjectId || selectedClass?.subjects[0]?.subjectId || "";

  const questions = useQuery({
    queryKey: ["learning", "question-bank", "questions", organizationId],
    queryFn: () => learningAssessmentService.listQuestions(organizationId),
    enabled: Boolean(organizationId),
  });
  const objectives = useQuery({
    queryKey: ["learning", "question-bank", "objectives", activeClassGroupId, selectedSubjectId],
    queryFn: async () => {
      if (!selectedClass || !selectedSubjectId) return [];
      const skills = await learningContentService.listSkills(selectedSubjectId);
      const topicsBySkill = await Promise.all(skills.map((skill) => learningContentService.listTopics(skill.id)));
      const topics = topicsBySkill.flat();
      const objectivesByTopic = await Promise.all(topics.map((topic) => learningContentService.listObjectives(topic.id)));
      const classObjectives = objectivesByTopic.flat();
      const alignments = await learningContentService.listAlignments(
        undefined,
        selectedClass.classGroup.curriculumId,
        selectedClass.classGroup.gradeLevelId,
      );
      const alignedIds = new Set(alignments.map((alignment) => alignment.objectiveId));
      return classObjectives.filter((objective) => alignedIds.has(objective.id));
    },
    enabled: Boolean(selectedClass && selectedSubjectId),
  });

  const academicQuestionIds = useQuery({
    queryKey: ["learning", "question-bank", "academic-questions", activeClassGroupId, selectedSubjectId, questions.data?.length, objectives.data?.length],
    queryFn: async () => {
      const allowedObjectiveIds = new Set((objectives.data ?? []).map((objective) => objective.id));
      const matches = await Promise.all((questions.data ?? []).map(async (question) => {
        const versions = await learningAssessmentService.listQuestionVersions(question.id);
        const relevantVersion = question.status === "published"
          ? versions.find((version) => version.publishedAt !== null)
          : versions[0];
        if (!relevantVersion) return null;
        const mappings = await learningAssessmentService.listQuestionObjectives(relevantVersion.id);
        return mappings.length && mappings.every((mapping) => allowedObjectiveIds.has(mapping.objectiveId))
          ? question.id
          : null;
      }));
      return new Set(matches.filter((id): id is string => id !== null));
    },
    enabled: questions.isSuccess && objectives.isSuccess && Boolean(selectedClass && selectedSubjectId),
  });

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (questions.data ?? []).filter((question) => {
      const matchesAcademicScope = academicQuestionIds.data?.has(question.id) ?? false;
      const matchesSearch = !term || question.code.toLowerCase().includes(term) || question.questionType.toLowerCase().includes(term);
      return matchesAcademicScope && matchesSearch && (!typeFilter || question.questionType === typeFilter) && (!statusFilter || question.status === statusFilter);
    });
  }, [questions.data, academicQuestionIds.data, search, typeFilter, statusFilter]);

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
      if (!latest) throw new Error(t("questionBank.noVersion"));
      const mappedType = teacherTypes.includes(question.questionType as TeacherQuestionType)
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
      setMessage(t("questionBank.newVersionPrepared"));
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !organizationId || !selectedClass || !selectedSubjectId) throw new Error("Select a class and an active subject first.");
      if (!code.trim() || !prompt.trim() || !objectiveId) throw new Error(t("questionBank.required"));
      if (questionType === "single_choice" && choices.some((choice) => !choice.label.trim())) throw new Error(t("questionBank.completeOptions"));
      if ((questionType === "single_choice" || questionType === "true_false") && !correctOption) throw new Error(t("questionBank.chooseCorrect"));
      if (questionType === "short_answer" && !shortAnswer.trim()) throw new Error(t("questionBank.enterExpected"));

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
      setMessage(wasVersion ? t("questionBank.versionSaved") : t("questionBank.questionSaved"));
      resetForm();
      await qc.invalidateQueries({ queryKey: ["learning", "question-bank"] });
      await qc.invalidateQueries({ queryKey: ["learning", "authoring", "questions"] });
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => learningAssessmentService.publishQuestion(id, user!.id),
    onSuccess: async () => {
      setMessage(t("questionBank.published"));
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

  if (!user) return <Panel title={t("questionBank.title")}><p>{t("questionBank.signIn")}</p></Panel>;
  if (classes.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError) return <Panel title={t("questionBank.title")}><p>{t("questionBank.loadError")}</p></Panel>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/teacher" className="text-sm text-slate-500 hover:text-slate-900">{t("questionBank.back")}</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{t("questionBank.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("questionBank.intro")}</p>
        </div>
        <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"><Plus size={16} />{t("questionBank.new")}</button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{t("questionBank.teacherClass")}</span>
            <select value={activeClassGroupId} onChange={(e) => { setClassGroupId(e.target.value); setSubjectId(""); setObjectiveId(""); }} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option value="">{t("questionBank.selectClass")}</option>
              {classes.data?.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>)}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Subject</span>
            <select value={selectedSubjectId} onChange={(e) => { setSubjectId(e.target.value); setObjectiveId(""); }} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" disabled={!selectedClass?.subjects.length}>
              {selectedClass?.subjects.map((item) => <option key={item.subjectId} value={item.subjectId}>{item.subject.name}</option>)}
            </select>
          </label>
        </div>
        {selectedClass && !selectedClass.subjects.length && <p className="mt-2 text-xs text-amber-700">This class has no active subjects assigned.</p>}
      </section>

      {message && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-slate-900"><FileQuestion size={18} />{t("questionBank.library")}</h2><p className="mt-1 text-xs text-slate-500">{t("questionBank.libraryHelp")}</p></div><span className="text-xs text-slate-500">{filteredQuestions.length} {t("questionBank.shown")}</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm" placeholder={t("questionBank.searchPlaceholder")} /></label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">{t("questionBank.allTypes")}</option>{teacherTypes.map((type) => <option key={type} value={type}>{questionTypeLabel(type)}</option>)}</select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">{t("questionBank.allStatus")}</option><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option><option value="retired">Retired</option></select>
          </div>
          {(search || typeFilter || statusFilter) && <button type="button" onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }} className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{t("questionBank.clearFilters")}</button>}
          {(questions.isPending || objectives.isPending || academicQuestionIds.isPending) && <p className="mt-4 text-sm text-slate-500">Loading questions for this class subject and grade…</p>}
          {questions.isError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{t("questionBank.loadError")}</p>}
          <div className="mt-4 space-y-2">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{question.code}</p><p className="text-xs text-slate-500">{questionTypeLabel(question.questionType)} · {questionStatusLabel(question.status)}</p></div><span className="text-xs text-slate-400">{question.languageCode}</span></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.status !== "published" && <button type="button" onClick={() => publishMutation.mutate(question.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">{t("questionBank.publish")}</button>}
                  <button type="button" onClick={() => prepareNewVersion.mutate(question.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">{t("questionBank.newVersion")}</button>
                </div>
              </div>
            ))}
            {!filteredQuestions.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t("questionBank.noMatches")}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">{editingQuestionId ? t("questionBank.createVersion") : t("questionBank.create")}</h2>{editingQuestionId && <button type="button" onClick={resetForm} className="text-slate-400"><X size={18} /></button>}</div>
          <div className="mt-5 space-y-4">
            <Field label={t("questionBank.code")}><input disabled={Boolean(editingQuestionId)} value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="ENG-M1-Q001" /></Field>
            <Field label={t("questionBank.type")}><select disabled={Boolean(editingQuestionId)} value={questionType} onChange={(e) => { const next = e.target.value as TeacherQuestionType; setQuestionType(next); setCorrectOption(next === "single_choice" ? "a" : ""); }} className="input">{teacherTypes.map((type) => <option key={type} value={type}>{questionTypeLabel(type)}</option>)}</select></Field>
            <Field label={t("questionBank.prompt")}><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="input" placeholder={t("questionBank.promptPlaceholder")} /></Field>

            {questionType === "single_choice" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><div><span className="text-sm font-medium text-slate-700">{t("questionBank.options")}</span><p className="mt-0.5 text-xs text-slate-500">{t("questionBank.optionsHelp")}</p></div><button type="button" onClick={addChoice} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Plus size={14} />{t("questionBank.addOption")}</button></div>
                {choices.map((choice, index) => <div key={choice.key} className="flex items-center gap-2"><input type="radio" name="correct-option" checked={correctOption === choice.key} onChange={() => setCorrectOption(choice.key)} /><span className="w-5 text-sm font-semibold">{choice.key.toUpperCase()}</span><input value={choice.label} onChange={(e) => updateChoice(index, e.target.value)} className="input flex-1" placeholder={t("questionBank.optionPlaceholder")} /><button type="button" onClick={() => removeChoice(index)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><X size={16} /></button></div>)}
                
              </div>
            )}

            {questionType === "true_false" && <Field label={t("questionBank.correct")}><select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)} className="input"><option value="">{t("questionBank.selectCorrect")}</option><option value="true">{t("questionBank.trueLabel")}</option><option value="false">{t("questionBank.falseLabel")}</option></select></Field>}

            {questionType === "short_answer" && <Field label={t("questionBank.expected")}><input value={shortAnswer} onChange={(e) => setShortAnswer(e.target.value)} className="input" placeholder={t("questionBank.expectedPlaceholder")} /><p className="mt-1 text-xs text-slate-500">{t("questionBank.shortAnswerNote")}</p></Field>}

            <Field label={t("questionBank.objective")}><select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)} className="input"><option value="">{t("questionBank.selectObjective")}</option>{objectives.data?.map((objective) => <option key={objective.id} value={objective.id}>{objective.code} — {objective.name}</option>)}</select></Field>
            <Field label={t("questionBank.explanation")}><textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} className="input" placeholder={t("questionBank.explanationPlaceholder")} /></Field>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">{t("questionBank.draftHelp")}</p><button type="button" disabled={!organizationId || !selectedSubjectId || !objectiveId || objectives.isPending || createMutation.isPending} onClick={() => createMutation.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"><Sparkles size={16} />{createMutation.isPending ? t("questionBank.saving") : editingQuestionId ? t("questionBank.saveVersion") : t("questionBank.saveDraft")}</button></div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="flex items-start gap-3"><Send size={18} className="mt-0.5" /><div><p className="font-semibold">{t("questionBank.workflow")}</p><p className="mt-1 text-sm text-slate-300">{t("questionBank.workflowHelp")}</p></div></div>
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
