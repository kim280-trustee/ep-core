import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, FileText, Save, Send, Archive, ClipboardPlus, Plus, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n";
import { Link, useNavigate, useParams } from "react-router-dom";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentStatus } from "@/features/learning-content";

const statusClasses: Record<LearningContentStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  retired: "bg-red-100 text-red-700",
};

export default function TeacherContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [bodyEdited, setBodyEdited] = useState(false);
  const [starterCodeDraft, setStarterCodeDraft] = useState("");
  const [projectRequirementsDraft, setProjectRequirementsDraft] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [retiring, setRetiring] = useState(false);
  const [preview, setPreview] = useState(false);
  const [mappingCurriculumId, setMappingCurriculumId] = useState("");
  const [mappingGradeLevelId, setMappingGradeLevelId] = useState("");
  const [mappingSubjectId, setMappingSubjectId] = useState("");
  const [mappingSkillId, setMappingSkillId] = useState("");
  const [mappingTopicId, setMappingTopicId] = useState("");
  const [mappingObjectiveId, setMappingObjectiveId] = useState("");
  const [savingMapping, setSavingMapping] = useState(false);

  const classes = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const organizationId = classes.data?.[0]?.membership.organizationId;

  const content = useQuery({
    queryKey: ["learning", "content", id],
    queryFn: async () => {
      const items = await learningContentService.listContent(organizationId);
      const item = items.find((candidate) => candidate.id === id);
      if (!item) throw new Error("Content item not found.");
      return item;
    },
    enabled: Boolean(id && organizationId),
  });

  const versions = useQuery({
    queryKey: ["learning", "content-versions", id],
    queryFn: () => learningContentService.listContentVersions(id!),
    enabled: Boolean(id && organizationId),
  });

  const objectives = useQuery({
    queryKey: ["learning", "content-objectives", id],
    queryFn: () => learningContentService.listContentObjectives(id!),
    enabled: Boolean(id && organizationId),
  });

  const objectiveAcademicContext = useQuery({
    queryKey: ["learning", "content-objective-academic-context", id],
    queryFn: async () => {
      const [subjects, curricula, gradeLevels, skills, topics, learningObjectives, alignments] = await Promise.all([
        learningContentService.listSubjects(),
        learningContentService.listCurricula(),
        learningContentService.listGradeLevels(),
        learningContentService.listSkills(),
        learningContentService.listTopics(),
        learningContentService.listObjectives(),
        learningContentService.listAlignments(),
      ]);
      return { subjects, curricula, gradeLevels, skills, topics, learningObjectives, alignments };
    },
    enabled: Boolean(id && organizationId && objectives.data),
    staleTime: 5 * 60 * 1000,
  });

  const objectiveAcademicDetails = useMemo(() => {
    const context = objectiveAcademicContext.data;
    if (!context) return [];
    const subjectById = new Map(context.subjects.map((entry) => [entry.id, entry]));
    const curriculumById = new Map(context.curricula.map((entry) => [entry.id, entry]));
    const gradeById = new Map(context.gradeLevels.map((entry) => [entry.id, entry]));
    const skillById = new Map(context.skills.map((entry) => [entry.id, entry]));
    const topicById = new Map(context.topics.map((entry) => [entry.id, entry]));
    const objectiveById = new Map(context.learningObjectives.map((entry) => [entry.id, entry]));

    return (objectives.data ?? []).map((link) => {
      const objective = objectiveById.get(link.objectiveId);
      const topic = objective ? topicById.get(objective.topicId) : undefined;
      const skill = topic ? skillById.get(topic.skillId) : undefined;
      const subject = skill ? subjectById.get(skill.subjectId) : undefined;
      const alignments = context.alignments
        .filter((alignment) => alignment.objectiveId === link.objectiveId)
        .map((alignment) => ({
          curriculum: curriculumById.get(alignment.curriculumId),
          grade: gradeById.get(alignment.gradeLevelId),
        }))
        .filter((alignment) => alignment.curriculum && alignment.grade);
      return { ...link, objective, topic, skill, subject, alignments };
    });
  }, [objectives.data, objectiveAcademicContext.data]);

  const mappingGradeLevels = useQuery({
    queryKey: ["learning", "content-mapping-grade-levels", mappingCurriculumId],
    queryFn: () => learningContentService.listGradeLevels(mappingCurriculumId),
    enabled: Boolean(mappingCurriculumId && content.data?.status === "draft"),
  });
  const mappingSubjects = useQuery({
    queryKey: ["learning", "content-mapping-subjects", mappingCurriculumId],
    queryFn: () => learningContentService.listSubjects(mappingCurriculumId),
    enabled: Boolean(mappingCurriculumId && content.data?.status === "draft"),
  });
  const mappingSkills = useQuery({
    queryKey: ["learning", "content-mapping-skills", mappingSubjectId],
    queryFn: () => learningContentService.listSkills(mappingSubjectId),
    enabled: Boolean(mappingSubjectId && content.data?.status === "draft"),
  });
  const mappingTopics = useQuery({
    queryKey: ["learning", "content-mapping-topics", mappingSkillId],
    queryFn: () => learningContentService.listTopics(mappingSkillId),
    enabled: Boolean(mappingSkillId && content.data?.status === "draft"),
  });
  const mappingObjectives = useQuery({
    queryKey: ["learning", "content-mapping-objectives", mappingTopicId],
    queryFn: () => learningContentService.listObjectives(mappingTopicId),
    enabled: Boolean(mappingTopicId && content.data?.status === "draft"),
  });
  const mappingAlignments = useQuery({
    queryKey: ["learning", "content-mapping-alignments", mappingCurriculumId, mappingGradeLevelId],
    queryFn: () => learningContentService.listAlignments(undefined, mappingCurriculumId, mappingGradeLevelId),
    enabled: Boolean(mappingCurriculumId && mappingGradeLevelId && content.data?.status === "draft"),
  });

  const latestVersion = versions.data?.[0];
  const latestStructuredActivity = useMemo(() => {
    if (!latestVersion?.body || !Array.isArray(latestVersion.body.sections)) return null;
    const section = latestVersion.body.sections.find((item) => Boolean(
      item && typeof item === "object" &&
      ["code_activity", "project_activity"].includes(String((item as Record<string, unknown>).type)),
    ));
    return section && typeof section === "object" ? section as Record<string, unknown> : null;
  }, [latestVersion]);

  // Hydrate editable teacher drafts when the asynchronously loaded version changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!latestStructuredActivity) return;
    setStarterCodeDraft(typeof latestStructuredActivity.starterCode === "string" ? latestStructuredActivity.starterCode : "");
    setProjectRequirementsDraft(typeof latestStructuredActivity.requirements === "string" ? latestStructuredActivity.requirements : "");
  }, [latestStructuredActivity]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const latestBody = useMemo(() => {
    if (!latestVersion?.body) return "";
    const sections = Array.isArray(latestVersion.body.sections)
      ? latestVersion.body.sections
      : [];
    return sections
      .filter((section) => {
        if (!section || typeof section !== "object") return false;
        const record = section as Record<string, unknown>;
        const title = typeof record.title === "string" ? record.title.toLowerCase() : "";
        const legacyTeacherSection = /safety and teaching guidance|teacher guidance|teacher notes|teaching notes/.test(title);
        return record.type !== "teacher_only" && record.audience !== "teacher" && !legacyTeacherSection;
      })
      .map((section) => {
        if (!section || typeof section !== "object") return "";
        const value = (section as Record<string, unknown>).body;
        return typeof value === "string" ? value : "";
      })
      .filter(Boolean)
      .join("\n\n");
  }, [latestVersion]);

  const latestTeacherGuidance = useMemo(() => {
    if (!latestVersion?.body || !Array.isArray(latestVersion.body.sections)) return [];
    return latestVersion.body.sections.flatMap((section) => {
      if (!section || typeof section !== "object") return [];
      const record = section as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : "Teacher guidance";
      const legacyTeacherSection = /safety and teaching guidance|teacher guidance|teacher notes|teaching notes/i.test(title);
      if (record.type !== "teacher_only" && record.audience !== "teacher" && !legacyTeacherSection) return [];
      const bodyText = typeof record.body === "string" ? record.body.trim() : "";
      if (!bodyText) return [];
      return [{ title, body: bodyText }];
    });
  }, [latestVersion]);

  const currentBody = bodyEdited ? body : latestBody;
  const item = content.data;
  const currentContentSubjectId = objectiveAcademicDetails.find((entry) => entry.subject)?.subject?.id ?? "";
  const availableMappingSubjects = (mappingSubjects.data ?? []).filter((subject) =>
    !currentContentSubjectId || subject.id === currentContentSubjectId
  );
  const alignedMappingObjectiveIds = new Set((mappingAlignments.data ?? []).map((alignment) => alignment.objectiveId));
  const availableMappingObjectives = (mappingObjectives.data ?? []).filter((objective) =>
    alignedMappingObjectiveIds.has(objective.id) &&
    !(objectives.data ?? []).some((linked) => linked.objectiveId === objective.id)
  );
  const isRetired = item?.status === "retired";
  const isPublished = item?.status === "published";
  const isReview = item?.status === "review";
  const isDraft = item?.status === "draft";

  async function saveVersion(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A current content version is required before saving.");
      return;
    }
    if (isRetired) {
      setError("Retired content cannot be edited.");
      return;
    }
    if (!currentBody.trim()) {
      setError("Learning content cannot be empty.");
      return;
    }

    const existingStructuredSection = Array.isArray(latestVersion.body.sections)
      ? latestVersion.body.sections.find((section) => Boolean(
          section && typeof section === "object" &&
          ["code_activity", "project_activity"].includes(String((section as Record<string, unknown>).type)),
        )) as Record<string, unknown> | undefined
      : undefined;

    setSaving(true);
    try {
      await learningContentService.createVersion({
        contentItemId: id,
        versionNo: latestVersion.versionNo + 1,
        body: {
          sections: [
            ...(existingStructuredSection ? [{
              type: String(existingStructuredSection.type),
              title: typeof existingStructuredSection.title === "string" ? existingStructuredSection.title : "Practical activity",
              body: currentBody.trim(),
              instructions: currentBody.trim(),
              ...(existingStructuredSection.type === "code_activity" ? {
                starterCode: starterCodeDraft,
                language: typeof existingStructuredSection.language === "string" ? existingStructuredSection.language : "javascript",
              } : {
                requirements: projectRequirementsDraft,
              }),
            }] : [{ type: "text", title: "Content", body: currentBody.trim() }]),
            ...latestTeacherGuidance.map((section) => ({
              type: "teacher_only",
              audience: "teacher",
              title: section.title,
              body: section.body,
            })),
          ],
        },
        changeSummary: changeSummary.trim() || "Updated content",
        createdBy: user.id,
      });

      if (!isDraft) {
        await learningContentService.updateContentStatus(id, "draft", user.id);
      }

      setBody("");
      setBodyEdited(false);
      setChangeSummary("");
      await Promise.all([
        versions.refetch(),
        content.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the new version.");
    } finally {
      setSaving(false);
    }
  }

  async function addContentObjective(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!id || !isDraft || !mappingCurriculumId || !mappingGradeLevelId || !mappingSubjectId ||
      !mappingSkillId || !mappingTopicId || !mappingObjectiveId) {
      setError("Choose a curriculum, grade, subject and aligned learning objective.");
      return;
    }
    const selectedSkill = mappingSkills.data?.find((entry) => entry.id === mappingSkillId);
    const selectedTopic = mappingTopics.data?.find((entry) => entry.id === mappingTopicId);
    const selectedObjective = mappingObjectives.data?.find((entry) => entry.id === mappingObjectiveId);
    if (
      !selectedSkill || selectedSkill.subjectId !== mappingSubjectId ||
      !selectedTopic || selectedTopic.skillId !== mappingSkillId ||
      !selectedObjective || selectedObjective.topicId !== mappingTopicId ||
      !alignedMappingObjectiveIds.has(mappingObjectiveId)
    ) {
      setError("The selected objective does not match the chosen subject, curriculum and grade.");
      return;
    }
    if (currentContentSubjectId && selectedSkill.subjectId !== currentContentSubjectId) {
      setError("All objectives linked to this content must belong to the same subject. Remove its existing objectives first to change subject.");
      return;
    }

    setSavingMapping(true);
    try {
      const nextSequence = Math.max(0, ...(objectives.data ?? []).map((entry) => entry.sequenceNo)) + 1;
      await learningContentService.addObjective({ contentItemId: id, objectiveId: mappingObjectiveId, sequenceNo: nextSequence });
      setMappingObjectiveId("");
      await Promise.all([
        objectives.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "content-library-objectives"] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the learning objective.");
    } finally {
      setSavingMapping(false);
    }
  }

  async function removeContentObjective(objectiveId: string) {
    if (!id || !isDraft) return;
    setError("");
    setSavingMapping(true);
    try {
      await learningContentService.removeObjective(id, objectiveId);
      await Promise.all([
        objectives.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library"] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "content-library-objectives"] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the learning objective.");
    } finally {
      setSavingMapping(false);
    }
  }

  async function submitForReview() {
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A content version is required before review.");
      return;
    }
    if (!isDraft) {
      setError("Only draft content can be submitted for review.");
      return;
    }

    setReviewing(true);
    try {
      await learningContentService.updateContentStatus(id, "review", user.id);
      await Promise.all([
        content.refetch(),
        versions.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit this content for review.");
    } finally {
      setReviewing(false);
    }
  }

  async function publish() {
    setError("");

    if (!user?.id || !id || !latestVersion) {
      setError("A content version is required before publishing.");
      return;
    }
    if (!isReview) {
      setError("Content must be in review before it can be published.");
      return;
    }

    setPublishing(true);
    try {
      await learningContentService.updateContentStatus(id, "published", user.id);
      await Promise.all([
        content.refetch(),
        versions.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish this content.");
    } finally {
      setPublishing(false);
    }
  }

  async function retire() {
    setError("");

    if (!user?.id || !id) {
      setError("A content item is required before retiring.");
      return;
    }
    if (!isPublished) {
      setError("Only published content can be retired.");
      return;
    }

    setRetiring(true);
    try {
      await learningContentService.updateContentStatus(id, "retired", user.id);
      await Promise.all([
        content.refetch(),
        versions.refetch(),
        queryClient.invalidateQueries({ queryKey: ["learning", "teacher-content-library", organizationId] }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retire this content.");
    } finally {
      setRetiring(false);
    }
  }

  if (!user) return <Message text="Sign in to manage learning content." />;
  if (!id) return <Message text="No content item was selected." />;
  if (classes.isPending || (Boolean(organizationId) && (content.isPending || versions.isPending || objectives.isPending)) || (objectives.isSuccess && objectiveAcademicContext.isPending)) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  }
  if (classes.isError || !organizationId || content.isError || versions.isError || objectives.isError || !content.data) {
    return <Message text="We could not load this content item." />;
  }

  const currentItem = content.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/teacher/content"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={t("contentDetail.back")}
          >
            <ArrowLeft size={19} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <FileText size={18} />
              {t("contentDetail.teacherContent")}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{currentItem.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentItem.code} · {currentItem.languageCode.toUpperCase()}
            </p>
          </div>
        </div>
        <span className={"inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold " + statusClasses[currentItem.status]}>
          {t(`contentDetail.status.${currentItem.status}`)}
        </span>
      </header>

      {isPublished && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900">{t("contentDetail.reuse")}</h2>
              <p className="mt-1 text-sm text-emerald-800">{t("contentDetail.reuseHelp")}</p>
            </div>
            <Link
              to={"/teacher/assignments/new?contentId=" + currentItem.id}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <ClipboardPlus size={17} />
              Reuse in assignment
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Info label={t("contentDetail.type")} value={label(currentItem.contentType)} />
        <Info label={t("contentDetail.version")} value={latestVersion ? String(latestVersion.versionNo) : t("contentDetail.none")} />
        <Info label={t("contentDetail.objectives")} value={String(objectives.data?.length ?? 0)} />
      </section>

      {objectives.data?.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t("contentDetail.objectives")} and academic alignment</h2>
          {objectiveAcademicContext.isError ? (
            <p role="alert" className="mt-3 text-sm text-red-700">Subject and curriculum details could not be loaded. Refresh the page to verify this content's academic alignment.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {objectiveAcademicDetails.map((link) => (
                <div key={link.objectiveId} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-900">{link.objective?.name ?? "Learning objective unavailable"}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {[link.subject?.name, link.skill?.name, link.topic?.name, link.objective?.code].filter(Boolean).join(" · ") || link.objectiveId}
                  </p>
                  {link.alignments.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {link.alignments.map((alignment) => (
                        <span key={alignment.curriculum!.id + alignment.grade!.id} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                          {alignment.curriculum!.name} · {alignment.grade!.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-amber-700">No active curriculum and grade alignment was found.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {t("contentDetail.noObjective")}
        </section>
      )}

      {isDraft && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">Manage subject alignment</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Add or remove objectives while this content is a draft. All linked objectives must belong to the same subject.</p>

          {(objectives.data ?? []).length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current objectives</p>
              {(objectives.data ?? []).map((entry) => {
                const detail = objectiveAcademicDetails.find((candidate) => candidate.objectiveId === entry.objectiveId);
                return (
                  <div key={entry.objectiveId} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="min-w-0 text-sm text-slate-700">{detail?.objective?.name ?? entry.objectiveId}</span>
                    <button type="button" onClick={() => void removeContentObjective(entry.objectiveId)} disabled={savingMapping} className="shrink-0 rounded-lg p-2 text-red-700 hover:bg-red-100 disabled:opacity-50" aria-label="Remove learning objective">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={addContentObjective} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">Curriculum
              <select className="input mt-1 w-full" value={mappingCurriculumId} onChange={(event) => { setMappingCurriculumId(event.target.value); setMappingGradeLevelId(""); setMappingSubjectId(""); setMappingSkillId(""); setMappingTopicId(""); setMappingObjectiveId(""); }}>
                <option value="">Choose curriculum</option>
                {(objectiveAcademicContext.data?.curricula ?? []).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Grade
              <select className="input mt-1 w-full" value={mappingGradeLevelId} onChange={(event) => { setMappingGradeLevelId(event.target.value); setMappingObjectiveId(""); }} disabled={!mappingCurriculumId || mappingGradeLevels.isPending}>
                <option value="">Choose grade</option>
                {(mappingGradeLevels.data ?? []).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Subject
              <select className="input mt-1 w-full" value={mappingSubjectId} onChange={(event) => { setMappingSubjectId(event.target.value); setMappingSkillId(""); setMappingTopicId(""); setMappingObjectiveId(""); }} disabled={!mappingCurriculumId || mappingSubjects.isPending}>
                <option value="">Choose subject</option>
                {availableMappingSubjects.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Skill
              <select className="input mt-1 w-full" value={mappingSkillId} onChange={(event) => { setMappingSkillId(event.target.value); setMappingTopicId(""); setMappingObjectiveId(""); }} disabled={!mappingSubjectId || mappingSkills.isPending}>
                <option value="">Choose skill</option>
                {(mappingSkills.data ?? []).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Topic
              <select className="input mt-1 w-full" value={mappingTopicId} onChange={(event) => { setMappingTopicId(event.target.value); setMappingObjectiveId(""); }} disabled={!mappingSkillId || mappingTopics.isPending}>
                <option value="">Choose topic</option>
                {(mappingTopics.data ?? []).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">Learning objective
              <select className="input mt-1 w-full" value={mappingObjectiveId} onChange={(event) => setMappingObjectiveId(event.target.value)} disabled={!mappingTopicId || mappingObjectives.isPending || mappingAlignments.isPending}>
                <option value="">Choose aligned objective</option>
                {availableMappingObjectives.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({entry.code})</option>)}
              </select>
            </label>
            {(mappingGradeLevels.isError || mappingSubjects.isError || mappingSkills.isError || mappingTopics.isError || mappingObjectives.isError || mappingAlignments.isError) && <p role="alert" className="text-sm text-red-700 md:col-span-2">Academic options could not be loaded. Refresh the page and try again.</p>}
            {objectiveAcademicContext.isError && <p role="alert" className="text-sm text-red-700 md:col-span-2">The existing subject assignment could not be verified. Refresh before changing objectives.</p>}
            {currentContentSubjectId && <p className="text-xs text-slate-500 md:col-span-2">This content is currently assigned to {objectiveAcademicDetails.find((entry) => entry.subject?.id === currentContentSubjectId)?.subject?.name}. Select that subject for additional objectives. Remove all existing objectives before changing the content to another subject.</p>}
            <div className="md:col-span-2">
              <button type="submit" disabled={savingMapping || !mappingObjectiveId || objectiveAcademicContext.isError || objectiveAcademicContext.isPending || mappingGradeLevels.isError || mappingSubjects.isError || mappingSkills.isError || mappingTopics.isError || mappingObjectives.isError || mappingAlignments.isError || mappingAlignments.isPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                <Plus size={16} />{savingMapping ? "Saving…" : "Add objective"}
              </button>
            </div>
          </form>
        </section>
      )}

      {latestTeacherGuidance.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">Teacher only</span>
            <h2 className="font-semibold text-amber-950">Safety and teaching guidance</h2>
          </div>
          <p className="mt-1 text-sm text-amber-900">This guidance is visible to authorized teachers and is excluded from the student lesson.</p>
          <div className="mt-4 space-y-4">
            {latestTeacherGuidance.map((section, index) => (
              <article key={index}>
                <h3 className="text-sm font-semibold text-amber-950">{section.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-amber-900">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {isRetired && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {t("contentDetail.retired")}
        </section>
      )}

      <form onSubmit={saveVersion} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {isRetired ? t("contentDetail.versionHistory") : isPublished ? t("contentDetail.nextDraft") : t("contentDetail.editDraft")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isRetired
                  ? t("contentDetail.retiredReadOnly")
                  : isPublished
                    ? t("contentDetail.publishedHistory")
                    : isReview
                      ? t("contentDetail.reviewDraft")
                      : t("contentDetail.editLatest")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreview((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={17} />
              {preview ? t("contentDetail.hidePreview") : t("contentDetail.preview")}
            </button>
          </div>

          {!isRetired && (
            <>
              <textarea
                value={currentBody}
                onChange={(event) => {
                  setBodyEdited(true);
                  setBody(event.target.value);
                }}
                className="input mt-5 min-h-72 w-full resize-y"
                placeholder={t("contentDetail.writeContent")}
                required
              />

              {latestStructuredActivity?.type === "code_activity" && (
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Student starter code (JavaScript)</span>
                  <textarea value={starterCodeDraft} onChange={(event) => setStarterCodeDraft(event.target.value)} maxLength={12000} spellCheck={false} className="input min-h-56 w-full resize-y font-mono text-sm" />
                </label>
              )}
              {latestStructuredActivity?.type === "project_activity" && (
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Project submission requirements</span>
                  <textarea value={projectRequirementsDraft} onChange={(event) => setProjectRequirementsDraft(event.target.value)} maxLength={3000} rows={4} className="input w-full resize-y" />
                </label>
              )}

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">{t("contentDetail.changeSummary")}</span>
                <input
                  value={changeSummary}
                  onChange={(event) => setChangeSummary(event.target.value)}
                  className="input w-full"
                  placeholder={t("contentDetail.changePlaceholder")}
                />
              </label>
            </>
          )}

          {preview && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("contentDetail.preview")}</p>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                {currentBody || t("contentDetail.nothingPreview")}
              </div>
            </div>
          )}
        </section>

        {latestVersion && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">{t("contentDetail.versionHistory")}</h2>
            <div className="mt-4 space-y-2">
              {(versions.data ?? []).map((version) => (
                <div key={version.id} className="flex flex-col gap-1 rounded-xl border border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t("contentDetail.versionLabel")} {version.versionNo}</p>
                    <p className="text-xs text-slate-500">{version.changeSummary || t("contentDetail.noSummary")}</p>
                  </div>
                  <span className={"inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold " + statusClasses[version.status]}>
                    {t(`contentDetail.status.${version.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        {!isRetired && (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={saving || !currentBody.trim()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={17} />
              {saving ? t("contentDetail.saving") : t("contentDetail.saveVersion")}
            </button>

            {isDraft && (
              <button
                type="button"
                onClick={() => void submitForReview()}
                disabled={reviewing || !latestVersion || !objectives.data?.length}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                <Send size={17} />
                {reviewing ? t("contentDetail.submitting") : t("contentDetail.sendReview")}
              </button>
            )}

            {isReview && (
              <button
                type="button"
                onClick={() => void publish()}
                disabled={publishing || !latestVersion || !objectives.data?.length}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                <Send size={17} />
                {publishing ? t("contentDetail.publishing") : t("contentDetail.publish")}
              </button>
            )}

            {isPublished && (
              <button
                type="button"
                onClick={() => void retire()}
                disabled={retiring}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Archive size={17} />
                {retiring ? t("contentDetail.retiring") : t("contentDetail.retire")}
              </button>
            )}
          </div>
        )}
      </form>

      <button type="button" onClick={() => navigate("/teacher/content")} className="text-sm font-medium text-slate-500 hover:text-slate-900">
        Return to Content Library
      </button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
