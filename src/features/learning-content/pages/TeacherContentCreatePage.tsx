import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentType } from "@/features/learning-content";

const contentTypes: LearningContentType[] = [
  "lesson", "explanation", "reading", "listening", "speaking", "writing",
  "worksheet", "video", "audio", "interactive", "reference", "other",
];

export default function TeacherContentCreatePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [curriculumId, setCurriculumId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [contentType, setContentType] = useState<LearningContentType>("lesson");
  const [languageCode, setLanguageCode] = useState("en");
  const [body, setBody] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const classes = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const organizationId = classes.data?.[0]?.membership.organizationId;

  const curricula = useQuery({
    queryKey: ["learning", "curricula"],
    queryFn: () => learningContentService.listCurricula(),
    enabled: Boolean(user?.id),
  });
  const gradeLevels = useQuery({
    queryKey: ["learning", "grade-levels", curriculumId],
    queryFn: () => learningContentService.listGradeLevels(curriculumId),
    enabled: Boolean(curriculumId),
  });
  const subjects = useQuery({
    queryKey: ["learning", "subjects", curriculumId],
    queryFn: () => learningContentService.listSubjects(curriculumId),
    enabled: Boolean(curriculumId),
  });
  const skills = useQuery({
    queryKey: ["learning", "skills", subjectId],
    queryFn: () => learningContentService.listSkills(subjectId),
    enabled: Boolean(subjectId),
  });
  const topics = useQuery({
    queryKey: ["learning", "topics", skillId],
    queryFn: () => learningContentService.listTopics(skillId),
    enabled: Boolean(skillId),
  });
  const objectiveAlignments = useQuery({
    queryKey: ["learning", "objective-alignments", curriculumId, gradeLevelId],
    queryFn: () => learningContentService.listAlignments(undefined, curriculumId, gradeLevelId),
    enabled: Boolean(curriculumId && gradeLevelId),
  });
  const objectives = useQuery({
    queryKey: ["learning", "objectives", topicId],
    queryFn: () => learningContentService.listObjectives(topicId),
    enabled: Boolean(topicId),
  });
  const existingContent = useQuery({
    queryKey: ["learning", "teacher-content-library", organizationId],
    queryFn: () => learningContentService.listContent(organizationId),
    enabled: Boolean(organizationId),
  });

  const alignedObjectiveIds = useMemo(() => new Set((objectiveAlignments.data ?? []).map((item) => item.objectiveId)), [objectiveAlignments.data]);
  const selectedAlignment = objectiveAlignments.data?.find((item) => item.objectiveId === objectiveId);
  const selectedGradeLevel = gradeLevels.data?.find((item) => item.id === gradeLevelId);
  const selectedSubject = subjects.data?.find((item) => item.id === subjectId);
  const selectedSkill = skills.data?.find((item) => item.id === skillId);
  const selectedTopic = topics.data?.find((item) => item.id === topicId);
  const selectedObjective = useMemo(
    () => objectives.data?.find((item) => item.id === objectiveId),
    [objectives.data, objectiveId],
  );

  function changeCurriculum(value: string) {
    setCurriculumId(value);
    setGradeLevelId("");
    setSubjectId("");
    setSkillId("");
    setTopicId("");
    setObjectiveId("");
  }
  function changeGradeLevel(value: string) {
    setGradeLevelId(value);
    setObjectiveId("");
  }
  function changeSubject(value: string) {
    setSubjectId(value);
    setSkillId("");
    setTopicId("");
    setObjectiveId("");
  }
  function changeSkill(value: string) {
    setSkillId(value);
    setTopicId("");
    setObjectiveId("");
  }
  function changeTopic(value: string) {
    setTopicId(value);
    setObjectiveId("");
  }
  function changeTitle(value: string) {
    const oldAutoCode = slugify(title);
    setTitle(value);
    if (!code || code === oldAutoCode) setCode(slugify(value));
  }

  async function saveDraft(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!user?.id || !organizationId) {
      setError(t("contentCreate.organizationMissing"));
      return;
    }
    if (!curriculumId || !gradeLevelId || !subjectId || !skillId || !topicId || !objectiveId || !title.trim() || !code.trim() || !body.trim()) {
      setError(t("contentCreate.requiredFields"));
      return;
    }
    if (title.trim().length < 3 || title.trim().length > 200) {
      setError(t("contentCreate.titleLength"));
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(normalizedCode)) {
      setError(t("contentCreate.codeFormat"));
      return;
    }

    if (!selectedGradeLevel || !selectedSubject || !selectedSkill || !selectedTopic || !selectedObjective) {
      setError(t("contentCreate.alignmentUnavailable"));
      return;
    }

    if (!alignedObjectiveIds.has(objectiveId)) {
      setError(t("contentCreate.objectiveAlignment"));
      return;
    }

    if (existingContent.isError) {
      setError(t("contentCreate.codeCheckError"));
      return;
    }
    if (objectiveAlignments.isError) {
      setError(t("contentCreate.alignmentCheckError"));
      return;
    }
    if ((existingContent.data ?? []).some((item) => item.code.toUpperCase() === normalizedCode)) {
      setError(t("contentCreate.duplicateCode"));
      return;
    }

    setSaving(true);
    let createdContentId: string | null = null;
    try {
      const content = await learningContentService.createContent({
        organizationId,
        code: normalizedCode,
        title: title.trim(),
        contentType,
        languageCode,
        createdBy: user.id,
      });
      createdContentId = content.id;

      await learningContentService.createVersion({
        contentItemId: content.id,
        versionNo: 1,
        body: {
          sections: [{ type: "text", title: "Content", body: body.trim() }],
        },
        changeSummary: changeSummary.trim() || t("contentCreate.initialDraft"),
        createdBy: user.id,
      });

      await learningContentService.addObjective({
        contentItemId: content.id,
        objectiveId,
        sequenceNo: 1,
      });

      await queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] });
      navigate("/teacher/content", { replace: true });
    } catch (err) {
      if (createdContentId) {
        try {
          await learningContentService.deleteContent(createdContentId);
        } catch {
          // Preserve the original save error; the item can be recovered from the library if cleanup fails.
        }
      }
      setError(err instanceof Error ? err.message : t("contentCreate.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <Message text={t("contentCreate.signIn")} />;
  if (classes.isPending || curricula.isPending) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError || curricula.isError || !organizationId) return <Message text={t("contentCreate.organizationMissing")} />;
  if (gradeLevels.isError || subjects.isError || skills.isError || topics.isError || objectives.isError) {
    return <Message text={t("contentCreate.optionsError")} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center gap-3">
        <Link to="/teacher/content" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={t("contentCreate.back")}>
          <ArrowLeft size={19} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><BookOpen size={18} />{t("contentLibrary.teacherContent")}</div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("contentCreate.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("contentCreate.intro")}</p>
        </div>
      </header>

      <form onSubmit={saveDraft} className="space-y-6">
        <Section number="1" title={t("contentCreate.academicAlignment")} description={t("contentCreate.academicAlignmentHelp")}>
          <Field label={t("contentCreate.curriculum")}>
            <select value={curriculumId} onChange={(e) => changeCurriculum(e.target.value)} className="input w-full" required>
              <option value="">{t("contentCreate.selectCurriculum")}</option>
              {(curricula.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label={t("contentCreate.gradeLevel")}>
            <select value={gradeLevelId} onChange={(e) => changeGradeLevel(e.target.value)} className="input w-full" required>
              <option value="">
                {gradeLevels.isPending ? t("contentCreate.loadingGradeLevels") : gradeLevels.isError ? t("contentCreate.gradeLevelsError") : t("contentCreate.selectGrade")}
              </option>
              {(gradeLevels.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
            {!gradeLevels.isPending && !gradeLevels.isError && curriculumId && !(gradeLevels.data ?? []).length && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{t("contentCreate.noGradeLevels")}</p>}
          </Field>
          <Field label={t("contentCreate.subject")}>
            <select value={subjectId} onChange={(e) => changeSubject(e.target.value)} className="input w-full" required>
              <option value="">
                {subjects.isPending ? t("contentCreate.loadingSubjects") : subjects.isError ? t("contentCreate.subjectsError") : t("contentCreate.selectSubject")}
              </option>
              {(subjects.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
            {!subjects.isPending && !subjects.isError && curriculumId && !(subjects.data ?? []).length && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{t("contentCreate.noSubjects")}</p>}
          </Field>
          <Field label={t("contentCreate.skill")}>
            <select value={skillId} onChange={(e) => changeSkill(e.target.value)} className="input w-full" required>
              <option value="">{t("contentCreate.selectSkill")}</option>
              {(skills.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label={t("contentCreate.topic")}>
            <select value={topicId} onChange={(e) => changeTopic(e.target.value)} className="input w-full" required>
              <option value="">{t("contentCreate.selectTopic")}</option>
              {(topics.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </Field>
          <Field label={t("contentCreate.learningObjective")}>
            <select value={objectiveId} onChange={(e) => setObjectiveId(e.target.value)} className="input w-full" required>
              <option value="">{t("contentCreate.selectObjective")}</option>
              {(objectives.data ?? []).filter((item) => !gradeLevelId || alignedObjectiveIds.has(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
            {selectedObjective?.description && <p className="mt-2 text-xs text-slate-500">{selectedObjective.description}</p>}
            {objectiveId && objectiveAlignments.isPending && <p className="mt-2 text-xs text-slate-500">{t("contentCreate.checkingAlignment")}</p>}
            {objectiveId && !objectiveAlignments.isPending && !selectedAlignment && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{t("contentCreate.objectiveNotAligned")}</p>}
            {selectedAlignment && <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">{t("contentCreate.aligned")}{selectedAlignment.required ? " · " + t("contentCreate.required") : ""}{selectedAlignment.notes ? ` · ${selectedAlignment.notes}` : ""}</p>}
          </Field>
        </Section>

        <Section number="2" title={t("contentCreate.contentDetails")} description={t("contentCreate.contentDetailsHelp")}>
          <Field label={t("contentCreate.titleField")}>
            <input value={title} onChange={(e) => changeTitle(e.target.value)} className="input w-full" placeholder={t("contentCreate.titlePlaceholder")} required />
          </Field>
          <Field label={t("contentCreate.code")}>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input w-full" placeholder={t("contentCreate.codePlaceholder")} required />
          </Field>
          <Field label={t("contentCreate.contentType")}>
            <select value={contentType} onChange={(e) => setContentType(e.target.value as LearningContentType)} className="input w-full">
              {contentTypes.map((value) => <option key={value} value={value}>{t("contentLibrary." + value)}</option>)}
            </select>
          </Field>
          <Field label={t("contentCreate.language")}>
            <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} className="input w-full">
              <option value="en">English</option><option value="th">Thai</option><option value="sw">Swahili</option>
            </select>
          </Field>
        </Section>

        <Section number="3" title={t("contentCreate.contentBody")} description={t("contentCreate.contentBodyHelp")} full>
          <Field label={t("contentCreate.learningContent")}>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input min-h-64 w-full resize-y" placeholder={t("contentCreate.bodyPlaceholder")} required />
          </Field>
          <Field label={t("contentCreate.changeSummary")}>
            <input value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} className="input w-full" placeholder={t("contentCreate.initialDraft")} />
          </Field>
        </Section>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="flex justify-end gap-3">
          <Link to="/teacher/content" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t("contentCreate.cancel")}</Link>
          <button type="submit" disabled={saving || existingContent.isPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            <Save size={17} />{saving ? t("contentCreate.saving") : t("contentCreate.saveDraft")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ number, title, description, children, full = false }: { number: string; title: string; description: string; children: ReactNode; full?: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{number}</span><h2 className="text-lg font-semibold text-slate-900">{title}</h2></div>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <div className={`mt-5 grid gap-4 ${full ? "" : "md:grid-cols-2"}`}>{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}
function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}
function slugify(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
