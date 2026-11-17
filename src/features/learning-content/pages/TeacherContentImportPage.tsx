import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileUp, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import { learningAssessmentService } from "@/features/learning-assessment/services/learning-assessment.service";
import {
  learningContentService,
  learningPackImportService,
  parseTeacherPackMarkdown,
  type LearningPackImportLesson,
  type ParsedTeacherPackLesson,
} from "@/features/learning-content";

type ResolvedLesson = LearningPackImportLesson & {
  sourceNumber: number;
  sourceTitle: string;
};

const CHUNK_SIZE = 40;

export default function TeacherContentImportPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [classGroupId, setClassGroupId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [parsedLessons, setParsedLessons] = useState<ParsedTeacherPackLesson[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ lessons: 0, questions: 0 });
  const [message, setMessage] = useState("");

  const classes = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const selectedClassGroupId = classGroupId || classes.data?.[0]?.classGroup.id || "";
  const selectedClass = classes.data?.find((item) => item.classGroup.id === selectedClassGroupId);
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
  const activeSubjectId = subjectId && subjects.data?.some((item) => item.id === subjectId)
    ? subjectId
    : selectedClass?.subjects.find((item) => subjects.data?.some((subject) => subject.id === item.subjectId))?.subjectId
      || subjects.data?.[0]?.id || "";

  const catalogue = useQuery({
    queryKey: ["learning", "teacher-pack-import", "catalogue", activeSubjectId],
    queryFn: async () => {
      const skills = await learningContentService.listSkills(activeSubjectId);
      const topicGroups = await Promise.all(skills.map((skill) => learningContentService.listTopics(skill.id)));
      const topics = topicGroups.flat();
      const objectiveGroups = await Promise.all(topics.map((topic) => learningContentService.listObjectives(topic.id)));
      return objectiveGroups.flat();
    },
    enabled: Boolean(activeSubjectId),
  });
  const alignments = useQuery({
    queryKey: ["learning", "teacher-pack-import", "alignments", activeCurriculumId],
    queryFn: () => learningContentService.listAlignments(undefined, activeCurriculumId),
    enabled: Boolean(activeCurriculumId),
  });

  const resolved = useMemo(() => {
    const errors: string[] = [];
    const objectives = catalogue.data ?? [];
    const objectiveAlignments = alignments.data ?? [];
    const rows: ResolvedLesson[] = [];
    const seenCodes = new Set<string>();

    for (const lesson of parsedLessons) {
      let targetGradeLevelId = activeGradeLevelId;
      const gradeCode = lesson.objectiveCode?.match(/^(M[1-6])[-_]/i)?.[1]?.toUpperCase();
      if (gradeCode) {
        const grade = gradeLevels.data?.find((item) => item.code.toUpperCase() === gradeCode);
        if (grade) targetGradeLevelId = grade.id;
      }

      const alignedToGrade = (objectiveId: string, gradeId: string) =>
        objectiveAlignments.some((alignment) =>
          alignment.objectiveId === objectiveId &&
          alignment.curriculumId === activeCurriculumId &&
          alignment.gradeLevelId === gradeId
        );

      let objective = lesson.objectiveCode
        ? objectives.find((item) => item.code.toUpperCase() === lesson.objectiveCode)
        : undefined;

      if (!objective && lesson.objectiveText) {
        const normalizedText = normalizeText(lesson.objectiveText);
        const exactTextMatches = objectives.filter((item) =>
          normalizeText(item.name) === normalizedText ||
          normalizeText(item.description ?? "") === normalizedText
        );
        if (exactTextMatches.length === 1) {
          objective = exactTextMatches[0];
        } else if (!exactTextMatches.length) {
          const alignedCandidates = objectives.filter((item) => alignedToGrade(item.id, targetGradeLevelId));
          const scored = alignedCandidates
            .map((item) => ({
              item,
              score: textSimilarity(lesson.objectiveText!, item.description || item.name),
            }))
            .sort((left, right) => right.score - left.score);
          const best = scored[0];
          const runnerUp = scored[1];
          if (best && best.score >= 0.72 && (!runnerUp || best.score - runnerUp.score >= 0.08)) {
            objective = best.item;
          }
        }
      }

      if (!objective && lesson.objectiveCode) {
        errors.push(`Section ${lesson.number} “${lesson.title}”: objective code ${lesson.objectiveCode} was not found in the selected subject. The importer will not guess a replacement.`);
        continue;
      }

      if (!objective) {
        const candidates = objectives.filter((item) =>
          item.sequenceNo === lesson.outcomeNumber &&
          alignedToGrade(item.id, targetGradeLevelId)
        );
        if (candidates.length === 1) objective = candidates[0];
        else {
          errors.push(`Section ${lesson.number} “${lesson.title}”: ${candidates.length ? "the outcome number matches more than one objective" : "no objective matches the selected subject, grade and curriculum"}.`);
          continue;
        }
      }

      if (!alignedToGrade(objective.id, targetGradeLevelId)) {
        errors.push(`Section ${lesson.number} “${lesson.title}”: objective ${objective.code} is not aligned to grade ${gradeLevels.data?.find((item) => item.id === targetGradeLevelId)?.code ?? "selected grade"} in this curriculum.`);
        continue;
      }

      const contentCode = `EP-${objective.code}-LESSON`;
      if (seenCodes.has(contentCode)) {
        errors.push(`Objective ${objective.code} appears more than once in this pack.`);
        continue;
      }
      seenCodes.add(contentCode);

      rows.push({
        sourceNumber: lesson.number,
        sourceTitle: lesson.title,
        objectiveId: objective.id,
        objectiveCode: objective.code,
        gradeLevelId: targetGradeLevelId,
        title: lesson.title,
        learningOutcome: lesson.learningOutcome,
        activity: lesson.activity,
        questions: lesson.questions.map((question) => ({
          code: `EP-${objective!.code}-Q${String(question.number).padStart(2, "0")}`,
          prompt: question.prompt,
          expectedAnswer: question.expectedAnswer,
        })),
      });
    }

    return { rows, errors };
  }, [parsedLessons, catalogue.data, alignments.data, activeCurriculumId, activeGradeLevelId, gradeLevels.data]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setParsedLessons([]);
    setFileName("");
    setFileError("");
    setMessage("");
    setImportProgress({ lessons: 0, questions: 0 });
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".md")) {
      setFileError("Choose a Markdown (.md) teacher pack.");
      return;
    }
    try {
      const parsed = parseTeacherPackMarkdown(await file.text());
      setParsedLessons(parsed);
      setFileName(file.name);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "The teacher pack could not be read.");
    }
  }

  async function importPack() {
    if (!user?.id || !organizationId || !activeCurriculumId || !activeSubjectId) {
      setMessage("Sign in and select an organization, curriculum and subject before importing.");
      return;
    }
    if (!resolved.rows.length || resolved.errors.length) return;

    setImporting(true);
    setMessage("");
    setImportProgress({ lessons: 0, questions: 0 });
    let importedLessons = 0;
    let importedQuestions = 0;

    try {
      const [existingContent, existingQuestions] = await Promise.all([
        learningContentService.listContent(organizationId),
        learningAssessmentService.listQuestions(organizationId),
      ]);
      const contentCodes = new Set(existingContent.map((item) => item.code.toUpperCase()));
      const questionCodes = new Set(existingQuestions.map((item) => item.code.toUpperCase()));
      const duplicateContent = resolved.rows.find((item) => contentCodes.has(`EP-${item.objectiveCode}-LESSON`.toUpperCase()));
      const duplicateQuestion = resolved.rows.flatMap((item) => item.questions).find((item) => questionCodes.has(item.code.toUpperCase()));
      if (duplicateContent || duplicateQuestion) {
        throw new Error(`Import stopped because a code already exists in this organization: ${duplicateContent ? `EP-${duplicateContent.objectiveCode}-LESSON` : duplicateQuestion?.code}. Existing content is not overwritten.`);
      }

      for (let offset = 0; offset < resolved.rows.length; offset += CHUNK_SIZE) {
        const chunk = resolved.rows.slice(offset, offset + CHUNK_SIZE);
        const result = await learningPackImportService.importChunk({
          organizationId,
          createdBy: user.id,
          curriculumId: activeCurriculumId,
          subjectId: activeSubjectId,
          lessons: chunk,
        });
        importedLessons += result.lessons;
        importedQuestions += result.questions;
        setImportProgress({ lessons: importedLessons, questions: importedQuestions });
      }

      setMessage(`Imported ${importedLessons} lesson drafts and ${importedQuestions} question drafts. All items remain unpublished for teacher review.`);
      await queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "question-bank"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "authoring", "questions"] });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown import error.";
      setMessage(importedLessons
        ? `Partial import: ${importedLessons} lesson drafts and ${importedQuestions} question drafts were saved in completed chunks. The next chunk stopped: ${reason}`
        : `Nothing was imported: ${reason}`);
    } finally {
      setImporting(false);
    }
  }

  if (!user) return <Panel>Sign in with an authorized teacher account to import curriculum materials.</Panel>;
  if (classes.isPending || curricula.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError || !classes.data?.length || curricula.isError) {
    return <Panel>Teacher organization or curriculum access could not be loaded. No content has been imported.</Panel>;
  }

  const ready = Boolean(
    fileName &&
    resolved.rows.length === parsedLessons.length &&
    parsedLessons.length > 0 &&
    resolved.errors.length === 0 &&
    !catalogue.isPending &&
    !alignments.isPending &&
    !catalogue.isError &&
    !alignments.isError
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <Link to="/teacher/content" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Back to content library">
          <ArrowLeft size={19} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><FileUp size={18} />Teacher Content Library</div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Import a teacher pack</h1>
          <p className="mt-1 text-sm text-slate-500">Convert a Markdown teacher pack into linked lesson drafts and protected-answer practice questions.</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">1. Choose the authorized organization and academic scope</h2>
        <p className="mt-1 text-sm text-slate-500">The organization is taken from one of your assigned teacher classes. The selected class is not changed and no student or school records are created.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Organization access (teacher class)">
            <select value={selectedClassGroupId} onChange={(event) => setClassGroupId(event.target.value)} className="input w-full">
              {(classes.data ?? []).map((item) => (
                <option key={item.classGroup.id} value={item.classGroup.id}>
                  {item.classGroup.name} — {item.membership.organizationId.slice(0, 8)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Curriculum">
            <select value={activeCurriculumId} onChange={(event) => { setCurriculumId(event.target.value); setGradeLevelId(""); setSubjectId(""); }} className="input w-full">
              {(curricula.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Fallback grade for packs without objective codes">
            <select value={activeGradeLevelId} onChange={(event) => setGradeLevelId(event.target.value)} className="input w-full">
              {(gradeLevels.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label="Subject">
            <select value={activeSubjectId} onChange={(event) => setSubjectId(event.target.value)} className="input w-full">
              {(subjects.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
        </div>
        {organizationId && <p className="mt-3 text-xs text-slate-500">Organization: {organizationId}. Database permissions will independently verify your membership and teacher authoring rights.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">2. Select the Markdown teacher pack</h2>
        <p className="mt-1 text-sm text-slate-500">The importer recognises Lesson and Outcome sections, objective codes or grade-scoped outcome numbers, teaching notes, and three answer-keyed questions per lesson.</p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-5 py-8 text-center hover:bg-slate-50">
          <Upload size={24} className="text-slate-500" />
          <span className="mt-2 text-sm font-semibold text-slate-800">Choose one .md teacher pack</span>
          <span className="mt-1 text-xs text-slate-500">Maximum file size: 5 MB</span>
          <input type="file" accept=".md,text/markdown,text/plain" onChange={handleFileChange} className="sr-only" />
        </label>
        {fileName && <p className="mt-3 text-sm text-slate-700">Selected: <strong>{fileName}</strong></p>}
        {fileError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{fileError}</p>}
      </section>

      {parsedLessons.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">3. Validate the objective mappings</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>{parsedLessons.length} lessons detected</span>
            <span>{parsedLessons.length * 3} questions detected</span>
            <span>{resolved.rows.length} objectives matched</span>
          </div>
          {catalogue.isPending || alignments.isPending ? <p className="mt-4 text-sm text-slate-500">Checking active curriculum alignments…</p> : null}
          {(catalogue.isError || alignments.isError) && <p className="mt-4 text-sm text-red-700">Academic catalogue could not be loaded. No import is allowed.</p>}
          {resolved.errors.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Resolve these mapping issues before importing:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {resolved.errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {resolved.rows.map((lesson) => (
              <div key={lesson.objectiveCode} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{lesson.sourceNumber}. {lesson.sourceTitle}</span>
                <span className="text-xs text-slate-500">{lesson.objectiveCode} · {gradeLevels.data?.find((item) => item.id === lesson.gradeLevelId)?.code}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">4. Import as drafts</h2>
        <p className="mt-1 text-sm text-slate-500">Each lesson is linked to its exact objective. Its three questions are created as manual-review short answers, and answer keys remain in the protected evaluation-key table. Nothing is published.</p>
        {importProgress.lessons > 0 && <p className="mt-3 text-sm text-slate-700">Saved so far: {importProgress.lessons} lessons and {importProgress.questions} questions.</p>}
        {message && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/teacher/content" className="text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</Link>
          <button type="button" onClick={importPack} disabled={!ready || importing} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
            <Upload size={16} />{importing ? "Importing…" : "Import validated drafts"}
          </button>
        </div>
      </section>
    </div>
  );
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function textSimilarity(left: string, right: string) {
  const ignored = new Set(["the", "and", "of", "to", "a", "an", "in", "for", "using", "use", "how", "what", "with", "from", "by", "on", "at", "as", "is", "are", "be", "that", "this", "their", "its", "into", "across"]);
  const leftTokens = new Set(normalizeText(left).split(" ").filter((token) => token.length > 2 && !ignored.has(token)));
  const rightTokens = new Set(normalizeText(right).split(" ").filter((token) => token.length > 2 && !ignored.has(token)));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let intersection = 0;
  leftTokens.forEach((token) => { if (rightTokens.has(token)) intersection += 1; });
  return (2 * intersection) / (leftTokens.size + rightTokens.size);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{children}</div>;
}
