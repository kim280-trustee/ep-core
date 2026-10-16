import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BookOpenCheck, CheckCircle2, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "@/features/learning-assessment";
import { learningVocabularyService } from "../services/learning-vocabulary.service";
import type { LearningVocabularyEntry } from "../types/learning-vocabulary.types";

const fieldClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200";
const primaryClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryClass = "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";

function errorText(error: unknown) {
  return error instanceof Error && error.message ? error.message : "The vocabulary assignment could not be created. Refresh the page and try again.";
}


export default function TeacherVocabularyAssignmentPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [objectiveId, setObjectiveId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("Choose the best definition for each vocabulary word.");
  const [dueAt, setDueAt] = useState("");
  const [notice, setNotice] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);
  const [createdAssignmentId, setCreatedAssignmentId] = useState("");

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const activeClassGroupId = classGroupId || classesQuery.data?.[0]?.classGroup.id || "";
  const selectedClass = classesQuery.data?.find((item) => item.classGroup.id === activeClassGroupId);
  const organizationId = selectedClass?.classGroup.organizationId?.trim() || selectedClass?.membership.organizationId?.trim() || "";
  const tenantId = selectedClass?.membership.tenantId?.trim() || "";

  const entriesQuery = useQuery({
    queryKey: ["learning-vocabulary", "entries", organizationId, "graded-assignment"],
    queryFn: () => learningVocabularyService.listEntries(organizationId!, true),
    enabled: Boolean(organizationId),
  });
  const objectivesQuery = useQuery({
    queryKey: ["learning", "vocabulary-assignment", "objectives"],
    queryFn: () => learningContentService.listObjectives(),
    enabled: Boolean(user?.id),
  });
  const assessmentsQuery = useQuery({
    queryKey: ["learning", "assessment-builder", "assessments", organizationId],
    queryFn: () => learningAssessmentService.listAssessments(organizationId),
    enabled: Boolean(organizationId),
  });
  const assignmentsQuery = useQuery({
    queryKey: ["learning", "authoring", "assignments", activeClassGroupId],
    queryFn: () => learningAssignmentsService.listAssignmentHistoryForClass(activeClassGroupId),
    enabled: Boolean(activeClassGroupId),
  });

  const publishedEntries = useMemo(
    () => (entriesQuery.data ?? []).filter((entry) => entry.status === "published"),
    [entriesQuery.data],
  );
  const selectedEntries = selectedEntryIds
    .map((id) => publishedEntries.find((entry) => entry.id === id))
    .filter((entry): entry is LearningVocabularyEntry => Boolean(entry));
  const objectives = objectivesQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedClass || !organizationId || !tenantId) {
        throw new Error("Choose an active teaching class first.");
      }
      if (selectedEntries.length < 4) {
        throw new Error("Select exactly four published vocabulary words to create a four-option graded quiz.");
      }
      if (new Set(selectedEntries.map((entry) => entry.normalizedWord)).size !== selectedEntries.length) {
        throw new Error("Selected vocabulary words must be distinct.");
      }
      if (new Set(selectedEntries.map((entry) => entry.definition.trim().toLocaleLowerCase())).size !== selectedEntries.length) {
        throw new Error("Each selected word needs a distinct definition so the answer choices are unambiguous.");
      }
      if (!objectiveId || !objectives.some((objective) => objective.id === objectiveId)) {
        throw new Error("Choose the learning objective this vocabulary quiz assesses.");
      }
      const normalizedTitle = title.trim();
      if (!normalizedTitle) throw new Error("Enter an assignment title.");
      const assignmentCode = "VOC-" + Date.now().toString(36).toUpperCase();
      const assessmentCode = "VOCQ-" + Date.now().toString(36).toUpperCase();
      if ((assignmentsQuery.data ?? []).some((item) => item.code.toUpperCase() === assignmentCode)) {
        throw new Error("A generated assignment code already exists. Please retry.");
      }
      if ((assessmentsQuery.data ?? []).some((item) => item.code.toUpperCase() === assessmentCode)) {
        throw new Error("A generated assessment code already exists. Please retry.");
      }

      const createdQuestionIds: string[] = [];
      let assessmentId: string | null = null;
      let assignmentId: string | null = null;

      try {
        const assessment = await learningAssessmentService.createAssessment({
          organizationId,
          code: assessmentCode,
          title: normalizedTitle + " — Vocabulary Quiz",
          description: description.trim() || null,
          assessmentType: "assignment",
          languageCode: "en",
          createdBy: user.id,
        });
        assessmentId = assessment.id;

        for (let index = 0; index < selectedEntries.length; index += 1) {
          const entry = selectedEntries[index];
          const question = await learningAssessmentService.createQuestion({
            organizationId,
            code: assessmentCode + "-Q" + (index + 1),
            questionType: "single_choice",
            languageCode: entry.languageCode || "en",
            createdBy: user.id,
          });
          createdQuestionIds.push(question.id);
          const questionChoices = selectedEntries
            .map((choiceEntry, choiceIndex) => ({
              entry: choiceEntry,
              order: (choiceIndex + index) % selectedEntries.length,
            }))
            .sort((left, right) => left.order - right.order)
            .map((choice, optionIndex) => ({
              key: String.fromCharCode(97 + optionIndex),
              label: choice.entry.definition.trim(),
              entryId: choice.entry.id,
            }));
          const correctOption = questionChoices.find((choice) => choice.entryId === entry.id)?.key;
          if (!correctOption) throw new Error("The correct vocabulary answer could not be prepared.");
          const version = await learningAssessmentService.createQuestionVersion({
            questionId: question.id,
            versionNo: 1,
            prompt: { text: "What is the best definition of “" + entry.word + "”?" },
            configuration: { options: questionChoices.map(({ key, label }) => ({ key, label })) },
            explanation: entry.exampleSentence
              ? { text: "Example: " + entry.exampleSentence }
              : { text: "Definition: " + entry.definition },
            createdBy: user.id,
          });
          await learningAssessmentService.saveQuestionEvaluationKey({
            questionVersionId: version.id,
            evaluationKey: { correct_option_id: correctOption },
            scoringRules: { method: "exact_option" },
          });
          await learningAssessmentService.addQuestionObjective({
            questionVersionId: version.id,
            objectiveId,
            weight: 1,
          });
          await learningAssessmentService.publishQuestion(question.id, user.id);
          await learningAssessmentService.addAssessmentQuestion({
            assessmentId: assessment.id,
            questionVersionId: version.id,
            sequenceNo: index + 1,
            points: 1,
            required: true,
          });
        }
        await learningAssessmentService.publishAssessment(assessment.id, user.id);

        const assignment = await learningAssignmentsService.createAssignment({
          tenantId,
          organizationId,
          classSubjectId: null,
          code: assignmentCode,
          title: normalizedTitle,
          description: description.trim() || null,
          status: "draft",
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          instructions: { kind: "vocabulary_quiz", vocabularyEntryIds: selectedEntries.map((entry) => entry.id) },
          createdBy: user.id,
        });
        assignmentId = assignment.id;
        await learningAssignmentsService.addTarget({
          tenantId,
          organizationId,
          assignmentId: assignment.id,
          targetType: "class",
          classGroupId: selectedClass.classGroup.id,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        });
        await learningAssignmentsService.addItem({
          organizationId,
          assignmentId: assignment.id,
          itemType: "assessment",
          assessmentId: assessment.id,
          sequenceNo: 1,
          required: true,
        });
        await learningAssignmentsService.publishAssignment(assignment.id);
        return { assignmentId: assignment.id, assessmentId: assessment.id, questionCount: createdQuestionIds.length };
      } catch (error) {
        const partial = assignmentId
          ? " An assignment may have been created before publishing failed; inspect Authoring before retrying."
          : assessmentId
            ? " The assessment or some questions may already exist, possibly published without an assignment. Inspect Assessment Builder before retrying."
            : "";
        throw new Error(errorText(error) + partial);
      }
    },
    onSuccess: async (result) => {
      setCreatedAssignmentId(result.assignmentId);
      setNotice({ kind: "success", text: "Published graded vocabulary assignment created with " + result.questionCount + " questions. It is assigned to the selected class." });
      await queryClient.invalidateQueries({ queryKey: ["learning"] });
      await queryClient.invalidateQueries({ queryKey: ["learning-vocabulary"] });
    },
    onError: (error: Error) => {
      setCreatedAssignmentId("");
      setNotice({ kind: "error", text: error.message });
    },
  });

  const toggleEntry = (entryId: string, checked: boolean) => {
    setSelectedEntryIds((current) => checked
      ? current.length >= 4 ? current : [...current, entryId]
      : current.filter((id) => id !== entryId));
    setNotice(null);
    setCreatedAssignmentId("");
  };

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to create a vocabulary assignment.</div>;
  if (classesQuery.isPending) return <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />;
  if (classesQuery.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Your teaching classes could not be loaded. Refresh the page and try again.</div>;
  if (!classesQuery.data?.length) return <div className="rounded-2xl border border-slate-200 bg-white p-6">No active teaching classes are available for this account.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white/10 p-3"><BookOpenCheck size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-300">DICTIONARY · ASSESSMENT</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Graded Vocabulary Assignment</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Turn four published Dictionary entries into an auto-marked multiple-choice quiz, attach it to a class assignment, and publish it through the existing assessment and assignment workflow.</p>
          </div>
        </div>
      </header>

      {notice && (
        <div className={"flex items-start gap-3 rounded-xl border p-4 text-sm " + (notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : notice.kind === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 bg-slate-50 text-slate-700")}>
          {notice.kind === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div className="min-w-0 flex-1">
            <p>{notice.text}</p>
            {createdAssignmentId && <p className="mt-2"><Link className="font-semibold underline" to={"/teacher/authoring?assignmentId=" + createdAssignmentId}>Open the published assignment in Authoring</Link></p>}
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Teaching class
            <select className={fieldClass} value={activeClassGroupId} onChange={(event) => { setClassGroupId(event.target.value); setSelectedEntryIds([]); setCreatedAssignmentId(""); setNotice(null); }}>
              {(classesQuery.data ?? []).map((item) => <option key={item.classGroup.id} value={item.classGroup.id}>{item.classGroup.name} · {item.classGroup.code}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">Learning objective
            <select className={fieldClass} value={objectiveId} onChange={(event) => setObjectiveId(event.target.value)}>
              <option value="">Select an objective</option>
              {objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">Assignment title
            <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Unit 1 Vocabulary Check" maxLength={120} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Due date (optional)
            <input className={fieldClass} type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
          </label>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Instructions
            <textarea className={fieldClass} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Choose vocabulary</h2>
            <p className="mt-1 text-sm text-slate-500">Select four published entries. Their definitions become the answer choices for each question.</p>
          </div>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{selectedEntries.length} / 4 selected</p>
        </div>
        {entriesQuery.isPending ? <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" /> : entriesQuery.isError ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">Published vocabulary could not be loaded. Check your school access and retry.</p>
        ) : publishedEntries.length < 4 ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">At least four published Dictionary entries are needed. Publish more words in the Vocabulary section first.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {publishedEntries.map((entry) => {
              const checked = selectedEntryIds.includes(entry.id);
              const disabled = !checked && selectedEntryIds.length >= 4;
              return <label key={entry.id} className={"flex gap-3 rounded-xl border p-4 " + (checked ? "border-slate-900 bg-slate-50" : "border-slate-200") + (disabled ? " opacity-50" : " cursor-pointer")}>
                <input type="checkbox" className="mt-1 size-4 accent-slate-900" checked={checked} disabled={disabled} onChange={(event) => toggleEntry(entry.id, event.target.checked)} />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{entry.word}</span>
                  <span className="mt-1 block text-sm text-slate-600">{entry.definition}</span>
                  <span className="mt-2 block text-xs text-slate-500">{entry.topic || "General"} · {entry.difficulty}{entry.translation ? " · " + entry.translation : ""}</span>
                </span>
              </label>;
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-semibold text-slate-900">Publish the complete workflow</p>
          <p className="mt-1 text-sm text-slate-500">Creates four objective-linked questions, publishes the assessment, then creates and publishes the class assignment.</p>
        </div>
        <button type="button" className={primaryClass} disabled={createMutation.isPending || selectedEntries.length !== 4 || !title.trim() || !objectiveId || !organizationId || entriesQuery.isPending || objectivesQuery.isPending} onClick={() => { setNotice(null); createMutation.mutate(); }}>
          <Languages size={17} /> {createMutation.isPending ? "Creating and publishing…" : "Create graded assignment"}
        </button>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link className={secondaryClass} to="/teacher/vocabulary">Manage Dictionary</Link>
        <Link className={secondaryClass} to="/teacher/assessments">Assessment Builder</Link>
        <Link className={secondaryClass} to="/teacher/authoring">Assignment Authoring</Link>
      </div>
    </div>
  );
}
