import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileQuestion, Plus, Search, Send, Sparkles, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import { learningAssessmentService } from "../services/learning-assessment.service";
import { learningAssessmentAcademicService } from "../services/learning-assessment-academic.service";
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
  const [curriculumId, setCurriculumId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [questionPage, setQuestionPage] = useState(0);
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
  const curricula = useQuery({
    queryKey: ["learning", "curricula"],
    queryFn: () => learningContentService.listCurricula(),
    enabled: Boolean(user?.id),
  });
  const activeCurriculumId = curriculumId || selectedClass?.classGroup.curriculumId || curricula.data?.[0]?.id || "";
  const gradeLevels = useQuery({
    queryKey: ["learning", "grade-levels", activeCurriculumId],
    queryFn: () => learningContentService.listGradeLevels(activeCurriculumId),
    enabled: Boolean(activeCurriculumId),
  });
  const activeGradeLevelId = gradeLevelId && gradeLevels.data?.some((item) => item.id === gradeLevelId)
    ? gradeLevelId
    : selectedClass && selectedClass.classGroup.curriculumId === activeCurriculumId &&
      gradeLevels.data?.some((item) => item.id === selectedClass.classGroup.gradeLevelId)
      ? selectedClass.classGroup.gradeLevelId
      : gradeLevels.data?.[0]?.id || "";
  const subjects = useQuery({
    queryKey: ["learning", "subjects", activeCurriculumId],
    queryFn: () => learningContentService.listSubjects(activeCurriculumId),
    enabled: Boolean(activeCurriculumId),
  });
  const selectedSubjectId = subjectId && subjects.data?.some((item) => item.id === subjectId)
    ? subjectId
    : selectedClass?.subjects.find((item) => subjects.data?.some((subject) => subject.id === item.subjectId))?.subjectId
      || subjects.data?.[0]?.id || "";
  const academicScopeReady = Boolean(activeCurriculumId && activeGradeLevelId && selectedSubjectId);

  const questions = useQuery({
    queryKey: ["learning", "question-bank", "questions", organizationId],
    queryFn: () => learningAssessmentService.listQuestions(organizationId),
    enabled: Boolean(organizationId),
  });
  const objectives = useQuery({
    queryKey: ["learning", "question-bank", "objectives", activeCurriculumId, activeGradeLevelId, selectedSubjectId],
    queryFn: async () => {
      if (!selectedSubjectId || !activeCurriculumId || !activeGradeLevelId) return [];
      const skills = await learningContentService.listSkills(selectedSubjectId);
      const topicsBySkill = await Promise.all(skills.map((skill) => learningContentService.listTopics(skill.id)));
      const topics = topicsBySkill.flat();
      const objectivesByTopic = await Promise.all(topics.map((topic) => learningContentService.listObjectives(topic.id)));
      const subjectObjectives = objectivesByTopic.flat();
      const alignments = await learningContentService.listAlignments(undefined, activeCurriculumId, activeGradeLevelId);
      const alignedIds = new Set(alignments.map((alignment) => alignment.objectiveId));
      return subjectObjectives.filter((objective) => alignedIds.has(objective.id));
    },
    enabled: Boolean(selectedSubjectId && activeCurriculumId && activeGradeLevelId),
  });

  const academicQuestionIds = useQuery({
    queryKey: ["learning", "question-bank", "academic-questions", activeClassGroupId, activeCurriculumId, activeGradeLevelId, selectedSubjectId, questions.dataUpdatedAt, objectives.dataUpdatedAt],
    queryFn: async () => {
      const questionRows = questions.data ?? [];
      if (!questionRows.length) return new Map<string, string | null>();
      const allowedObjectiveIds = new Set((objectives.data ?? []).map((objective) => objective.id));
      const versionRows = await learningAssessmentAcademicService.listVersionScopeRows(questionRows.map((question) => question.id));
      const versionsByQuestion = new Map<string, typeof versionRows>();
      for (const version of versionRows) {
        const group = versionsByQuestion.get(version.question_id) ?? [];
        group.push(version);
        versionsByQuestion.set(version.question_id, group);
      }

      const selectedVersions: Array<{ questionId: string; versionId: string; latestVersionPublishedAt: string | null }> = [];
      for (const question of questionRows) {
        const versions = (versionsByQuestion.get(question.id) ?? []).sort((left, right) => right.version_no - left.version_no);
        const latestVersion = versions[0];
        const relevantVersion = question.status === "published"
          ? versions.find((version) => version.published_at !== null)
          : latestVersion;
        if (!relevantVersion) continue;
        const hasAcademicScope = Boolean(
          relevantVersion.curriculum_id && relevantVersion.grade_level_id && relevantVersion.subject_id
        );
        if (hasAcademicScope && (
          relevantVersion.curriculum_id !== activeCurriculumId ||
          relevantVersion.grade_level_id !== activeGradeLevelId ||
          relevantVersion.subject_id !== selectedSubjectId
        )) continue;
        selectedVersions.push({
          questionId: question.id,
          versionId: relevantVersion.id,
          latestVersionPublishedAt: latestVersion?.published_at ?? null,
        });
      }

      const objectiveRows = await learningAssessmentAcademicService.listObjectiveScopeRows(
        selectedVersions.map((version) => version.versionId),
      );
      const objectivesByVersion = new Map<string, string[]>();
      for (const mapping of objectiveRows) {
        const group = objectivesByVersion.get(mapping.question_version_id) ?? [];
        group.push(mapping.objective_id);
        objectivesByVersion.set(mapping.question_version_id, group);
      }

      const matches = new Map<string, string | null>();
      for (const selected of selectedVersions) {
        const mappedObjectives = objectivesByVersion.get(selected.versionId) ?? [];
        if (mappedObjectives.length && mappedObjectives.every((objectiveId) => allowedObjectiveIds.has(objectiveId))) {
          matches.set(selected.questionId, selected.latestVersionPublishedAt);
        }
      }
      return matches;
    },
    enabled: questions.isSuccess && objectives.isSuccess && Boolean(selectedClass && activeCurriculumId && activeGradeLevelId && selectedSubjectId),
  });

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (questions.data ?? []).filter((question) => {
      const matchesAcademicScope = academicQuestionIds.data?.has(question.id) ?? false;
      const matchesSearch = !term || question.code.toLowerCase().includes(term) || question.questionType.toLowerCase().includes(term);
      return matchesAcademicScope && matchesSearch && (!typeFilter || question.questionType === typeFilter) && (!statusFilter || question.status === statusFilter);
    });
  }, [questions.data, academicQuestionIds.data, search, typeFilter, statusFilter]);
  const questionPageSize = 50;
  const questionPageCount = Math.max(1, Math.ceil(filteredQuestions.length / questionPageSize));
  const currentQuestionPage = Math.min(questionPage, questionPageCount - 1);
  const visibleQuestions = filteredQuestions.slice(
    currentQuestionPage * questionPageSize,
    (currentQuestionPage + 1) * questionPageSize,
  );

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
      if (!user?.id || !organizationId || !selectedClass || !selectedSubjectId || !academicScopeReady) {
        throw new Error("Select an organization class, curriculum, grade and subject before creating questions.");
      }
      if (!code.trim() || !prompt.trim() || !objectiveId) throw new Error(t("questionBank.required"));
      if (!objectives.data?.some((objective) => objective.id === objectiveId)) {
        throw new Error("The selected learning objective is not available for this curriculum, grade and subject. Select a valid objective and try again.");
      }
      if (questionType === "single_choice" && choices.some((choice) => !choice.label.trim())) throw new Error(t("questionBank.completeOptions"));
      if ((questionType === "single_choice" || questionType === "true_false") && !correctOption) throw new Error(t("questionBank.chooseCorrect"));
      if (questionType === "short_answer" && !shortAnswer.trim()) throw new Error(t("questionBank.enterExpected"));

      const configuration = questionType === "single_choice"
        ? { options: choices.map((choice) => ({ key: choice.key, label: choice.label.trim() })) }
        : questionType === "true_false"
          ? { options: [{ key: "true", label: "True" }, { key: "false", label: "False" }] }
          : { response_mode: "manual_review" };

      await learningAssessmentService.createQuestionBundle({
        organizationId,
        questionId: editingQuestionId,
        code: code.trim().toUpperCase(),
        questionType,
        curriculumId: activeCurriculumId,
        gradeLevelId: activeGradeLevelId,
        subjectId: selectedSubjectId,
        prompt: { text: prompt.trim() },
        configuration,
        explanation: explanation.trim() ? { text: explanation.trim() } : null,
        evaluationKey: questionType === "short_answer"
          ? { expected_answer: shortAnswer.trim() }
          : { correct_option_id: correctOption },
        scoringRules: questionType === "short_answer"
          ? { method: "manual_review" }
          : { method: "exact_option" },
        objectiveId,
        languageCode: "en",
      });
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
        <div className="flex flex-wrap gap-2">
          <Link to="/teacher/content/import" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Import teacher pack</Link>
          <button type="button" onClick={resetForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"><Plus size={16} />{t("questionBank.new")}</button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Organization access class</span>
            <select value={activeClassGroupId} onChange={(e) => { setClassGroupId(e.target.value); setCurriculumId(""); setGradeLevelId(""); setSubjectId(""); setQuestionPage(0); resetForm(); setMessage(null); }} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              {classes.data?.map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name}</option>)}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Curriculum</span>
            <select value={activeCurriculumId} onChange={(e) => { setCurriculumId(e.target.value); setGradeLevelId(""); setSubjectId(""); setQuestionPage(0); resetForm(); }} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              {(curricula.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Grade</span>
            <select value={activeGradeLevelId} onChange={(e) => { setGradeLevelId(e.target.value); setQuestionPage(0); resetForm(); }} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              {(gradeLevels.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Subject</span>
            <select value={selectedSubjectId} onChange={(e) => { setSubjectId(e.target.value); setQuestionPage(0); resetForm(); setMessage(null); }} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              {(subjects.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
        </div>
        {selectedClass && selectedSubjectId && <p className="mt-3 text-xs text-slate-500">Organization: {organizationId} · Academic scope: {curricula.data?.find((item) => item.id === activeCurriculumId)?.name ?? "Curriculum"} · {gradeLevels.data?.find((item) => item.id === activeGradeLevelId)?.name ?? "Grade"} · {subjects.data?.find((item) => item.id === selectedSubjectId)?.name}</p>}
        {(curricula.isError || gradeLevels.isError || subjects.isError) && <p role="alert" className="mt-2 text-xs text-red-700">Curriculum, grade or subject options could not be loaded. Refresh before creating questions.</p>}
        {selectedClass && !academicScopeReady && <p role="alert" className="mt-2 text-xs text-amber-700">Select an active curriculum, grade and subject before creating questions.</p>}
      </section>

      {message && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-slate-900"><FileQuestion size={18} />{t("questionBank.library")}</h2><p className="mt-1 text-xs text-slate-500">{t("questionBank.libraryHelp")}</p></div><span className="text-xs text-slate-500">{filteredQuestions.length} {t("questionBank.shown")}</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setQuestionPage(0); }} className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm" placeholder={t("questionBank.searchPlaceholder")} /></label>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setQuestionPage(0); }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">{t("questionBank.allTypes")}</option>{teacherTypes.map((type) => <option key={type} value={type}>{questionTypeLabel(type)}</option>)}</select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setQuestionPage(0); }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="">{t("questionBank.allStatus")}</option><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option><option value="retired">Retired</option></select>
          </div>
          {(search || typeFilter || statusFilter) && <button type="button" onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); setQuestionPage(0); }} className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{t("questionBank.clearFilters")}</button>}
          {(questions.isPending || objectives.isPending || academicQuestionIds.isPending) && <p className="mt-4 text-sm text-slate-500">Loading questions for this organization, curriculum, grade and subject…</p>}
          {questions.isError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{t("questionBank.loadError")}</p>}
          {objectives.isError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">Learning objectives for this class, grade and subject could not be loaded. Question authoring is disabled until the academic scope can be verified.</p>}
          {academicQuestionIds.isError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">Question academic mappings could not be verified. Refresh the page before using this question bank.</p>}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Showing {filteredQuestions.length ? currentQuestionPage * questionPageSize + 1 : 0}–{Math.min((currentQuestionPage + 1) * questionPageSize, filteredQuestions.length)} of {filteredQuestions.length}</span>
            <div className="flex gap-2">
              <button type="button" disabled={currentQuestionPage === 0} onClick={() => setQuestionPage(currentQuestionPage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
              <span className="px-1 py-1.5">Page {currentQuestionPage + 1} / {questionPageCount}</span>
              <button type="button" disabled={currentQuestionPage + 1 >= questionPageCount} onClick={() => setQuestionPage(currentQuestionPage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {visibleQuestions.map((question) => (
              <div key={question.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{question.code}</p><p className="text-xs text-slate-500">{questionTypeLabel(question.questionType)} · {questionStatusLabel(question.status)}</p></div><span className="text-xs text-slate-400">{question.languageCode}</span></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(question.status !== "published" || academicQuestionIds.data?.get(question.id) === null) && <button type="button" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate(question.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{t("questionBank.publish")}</button>}
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

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">{t("questionBank.draftHelp")}</p><button type="button" disabled={!organizationId || !selectedClass || !academicScopeReady || !selectedSubjectId || !objectiveId || !objectives.isSuccess || objectives.isError || academicQuestionIds.isError || curricula.isError || gradeLevels.isError || subjects.isError || curricula.isPending || gradeLevels.isPending || subjects.isPending || createMutation.isPending} onClick={() => createMutation.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"><Sparkles size={16} />{createMutation.isPending ? t("questionBank.saving") : editingQuestionId ? t("questionBank.saveVersion") : t("questionBank.saveDraft")}</button></div>
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
