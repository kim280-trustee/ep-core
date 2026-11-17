import { useQuery } from "@tanstack/react-query";
import { BookOpen, ExternalLink, Plus, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher";
import type { LearningContentStatus, LearningContentType } from "@/features/learning-content";

const contentTypes: Array<LearningContentType | "all"> = [
  "all", "lesson", "explanation", "reading", "listening", "speaking", "writing",
  "worksheet", "video", "audio", "interactive", "reference", "other",
];
const statuses: Array<LearningContentStatus | "all"> = ["all", "draft", "review", "published", "retired"];
const typeLabels: Record<LearningContentType, string> = {
  lesson: "contentLibrary.lesson", explanation: "contentLibrary.explanation", reading: "contentLibrary.reading", listening: "contentLibrary.listening",
  speaking: "contentLibrary.speaking", writing: "contentLibrary.writing", worksheet: "contentLibrary.worksheet", video: "contentLibrary.video",
  audio: "contentLibrary.audio", interactive: "contentLibrary.interactive", reference: "contentLibrary.reference", other: "contentLibrary.other",
};
const statusClasses: Record<LearningContentStatus, string> = {
  draft: "bg-slate-100 text-slate-700", review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800", retired: "bg-red-100 text-red-700",
};

export default function TeacherContentLibraryPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LearningContentStatus | "all">("all");
  const [contentType, setContentType] = useState<LearningContentType | "all">("all");
  const [curriculumId, setCurriculumId] = useState("");
  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const classes = useQuery({ queryKey: ["learning", "teacher-classes", user?.id], queryFn: () => learningTeacherService.listTeacherClasses(user!.id), enabled: Boolean(user?.id) });
  const organizationId = classes.data?.[0]?.membership.organizationId;
  const content = useQuery({ queryKey: ["learning", "teacher-content-library", organizationId], queryFn: () => learningContentService.listContent(organizationId), enabled: Boolean(organizationId), refetchOnMount: "always" });

  const curricula = useQuery({
    queryKey: ["learning", "curricula"],
    queryFn: () => learningContentService.listCurricula(),
    enabled: Boolean(user?.id),
  });
  const gradeLevels = useQuery({
    queryKey: ["learning", "grade-levels", curriculumId],
    queryFn: () => learningContentService.listGradeLevels(curriculumId),
    enabled: Boolean(user?.id && curriculumId),
  });
  const subjects = useQuery({
    queryKey: ["learning", "subjects", curriculumId],
    queryFn: () => learningContentService.listSubjects(curriculumId || undefined),
    enabled: Boolean(user?.id),
  });
  const academicCatalog = useQuery({
    queryKey: ["learning", "content-library-academic-catalog"],
    queryFn: async () => {
      const [skills, topics, objectives] = await Promise.all([
        learningContentService.listSkills(),
        learningContentService.listTopics(),
        learningContentService.listObjectives(),
      ]);
      return { skills, topics, objectives };
    },
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
  });
  const objectiveAlignments = useQuery({
    queryKey: ["learning", "content-library-objective-alignments", curriculumId],
    queryFn: () => learningContentService.listAlignments(undefined, curriculumId || undefined),
    enabled: Boolean(user?.id && curriculumId),
  });
  const gradeObjectiveAlignments = useQuery({
    queryKey: ["learning", "content-library-grade-objective-alignments", curriculumId, gradeLevelId],
    queryFn: () => learningContentService.listAlignments(undefined, curriculumId, gradeLevelId),
    enabled: Boolean(user?.id && curriculumId && gradeLevelId),
  });
  const contentObjectiveMap = useQuery({
    queryKey: ["learning", "content-library-objectives", organizationId, content.data?.map((item) => item.id).join(",")],
    queryFn: async () => {
      const rows = await Promise.all((content.data ?? []).map(async (item) => ({
        contentId: item.id,
        objectives: await learningContentService.listContentObjectives(item.id),
      })));
      return new Map(rows.map((row) => [row.contentId, row.objectives.map((objective) => objective.objectiveId)]));
    },
    enabled: content.isSuccess && Boolean(organizationId),
    staleTime: 60 * 1000,
  });

  const academicSubjectIdsByContent = useMemo(() => {
    const result = new Map<string, Set<string>>();
    const catalog = academicCatalog.data;
    if (!catalog) return result;
    const topicById = new Map(catalog.topics.map((topic) => [topic.id, topic]));
    const skillById = new Map(catalog.skills.map((skill) => [skill.id, skill]));
    const objectiveById = new Map(catalog.objectives.map((objective) => [objective.id, objective]));
    for (const [contentId, objectiveIds] of contentObjectiveMap.data ?? []) {
      const subjectIds = new Set<string>();
      for (const objectiveId of objectiveIds) {
        const objective = objectiveById.get(objectiveId);
        const topic = objective ? topicById.get(objective.topicId) : undefined;
        const skill = topic ? skillById.get(topic.skillId) : undefined;
        if (skill) subjectIds.add(skill.subjectId);
      }
      result.set(contentId, subjectIds);
    }
    return result;
  }, [academicCatalog.data, contentObjectiveMap.data]);

  const curriculumObjectiveIds = useMemo(
    () => new Set((objectiveAlignments.data ?? []).map((alignment) => alignment.objectiveId)),
    [objectiveAlignments.data],
  );
  const gradeObjectiveIds = useMemo(
    () => new Set((gradeObjectiveAlignments.data ?? []).map((alignment) => alignment.objectiveId)),
    [gradeObjectiveAlignments.data],
  );
  const academicGradeNamesByContent = useMemo(() => {
    const gradeNamesByObjective = new Map<string, Set<string>>();
    const gradeNameById = new Map((gradeLevels.data ?? []).map((grade) => [grade.id, grade.name]));
    for (const alignment of objectiveAlignments.data ?? []) {
      const gradeName = gradeNameById.get(alignment.gradeLevelId);
      if (!gradeName) continue;
      const names = gradeNamesByObjective.get(alignment.objectiveId) ?? new Set<string>();
      names.add(gradeName);
      gradeNamesByObjective.set(alignment.objectiveId, names);
    }

    const result = new Map<string, string[]>();
    for (const [contentId, objectiveIds] of contentObjectiveMap.data ?? []) {
      const names = new Set<string>();
      for (const objectiveId of objectiveIds) {
        for (const name of gradeNamesByObjective.get(objectiveId) ?? []) names.add(name);
      }
      if (names.size) result.set(contentId, [...names].sort((a, b) => a.localeCompare(b)));
    }
    return result;
  }, [gradeLevels.data, objectiveAlignments.data, contentObjectiveMap.data]);
  const filteredContent = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (content.data ?? []).filter((item) => {
      const matchesSearch = !query || item.title.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
      const matchesStatus = status === "all" || item.status === status;
      const matchesType = contentType === "all" || item.contentType === contentType;
      const mappedObjectiveIds = contentObjectiveMap.data?.get(item.id) ?? [];
      const subjectIds = academicSubjectIdsByContent.get(item.id) ?? new Set<string>();
      const matchesSubject = !subjectId || subjectIds.has(subjectId);
      const matchesCurriculum = !curriculumId || mappedObjectiveIds.some((id) => curriculumObjectiveIds.has(id));
      const matchesGrade = !gradeLevelId || mappedObjectiveIds.some((id) => gradeObjectiveIds.has(id));
      return matchesSearch && matchesStatus && matchesType && matchesSubject && matchesCurriculum && matchesGrade;
    });
  }, [content.data, contentObjectiveMap.data, academicSubjectIdsByContent, curriculumObjectiveIds, gradeObjectiveIds, search, status, contentType, subjectId, curriculumId, gradeLevelId]);

  function changeCurriculum(value: string) {
    setCurriculumId(value);
    setGradeLevelId("");
    setSubjectId("");
  }

  const academicFiltersPending = (content.isSuccess && contentObjectiveMap.isPending) ||
    (Boolean(curriculumId) && (objectiveAlignments.isPending || subjects.isPending || gradeLevels.isPending)) ||
    (Boolean(gradeLevelId) && gradeObjectiveAlignments.isPending) ||
    (Boolean(subjectId) && academicCatalog.isPending);
  const academicFiltersError = curricula.isError || subjects.isError || gradeLevels.isError || academicCatalog.isError ||
    (Boolean(curriculumId) && objectiveAlignments.isError) || (Boolean(gradeLevelId) && gradeObjectiveAlignments.isError) || contentObjectiveMap.isError;

  if (!user) return <EmptyState text={t("contentLibrary.signIn")} />;
  if (classes.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classes.isError) return <ErrorState text={t("contentLibrary.teacherContextError")} onRetry={() => void classes.refetch()} retryLabel={t("contentLibrary.tryAgain")} />;
  if (!classes.data?.length) return <EmptyState text={t("contentLibrary.noClass")} />;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><div className="flex items-center gap-2 text-sm font-medium text-slate-500"><BookOpen size={18} />{t("contentLibrary.teacherContent")}</div><h1 className="mt-1 text-2xl font-bold text-slate-900">{t("contentLibrary.title")}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{t("contentLibrary.intro")}</p></div>
          <div className="flex flex-wrap gap-2">
            <Link to="/teacher/content/import" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Plus size={17} />Import teacher pack</Link>
            <Link to="/teacher/content/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Plus size={17} />{t("contentLibrary.create")}</Link>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="relative block xl:col-span-2"><span className="sr-only">{t("contentLibrary.search")}</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("contentLibrary.searchPlaceholder")} className="input w-full pl-10" /></label>
          <label><span className="sr-only">Curriculum</span><select value={curriculumId} onChange={(event) => changeCurriculum(event.target.value)} className="input w-full"><option value="">All curricula</option>{(curricula.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span className="sr-only">Grade level</span><select value={gradeLevelId} onChange={(event) => setGradeLevelId(event.target.value)} className="input w-full" disabled={!curriculumId || gradeLevels.isPending || !gradeLevels.data?.length}><option value="">All grades</option>{(gradeLevels.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span className="sr-only">Subject</span><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="input w-full" disabled={subjects.isPending || !subjects.data?.length}><option value="">All subjects</option>{(subjects.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label><span className="sr-only">{t("contentLibrary.filterStatus")}</span><select value={status} onChange={(event) => setStatus(event.target.value as LearningContentStatus | "all")} className="input w-full">{statuses.map((value) => <option key={value} value={value}>{value === "all" ? t("contentLibrary.allStatuses") : t(`contentLibrary.status.${value}`)}</option>)}</select></label>
          <label><span className="sr-only">{t("contentLibrary.filterType")}</span><select value={contentType} onChange={(event) => setContentType(event.target.value as LearningContentType | "all")} className="input w-full"><option value="all">{t("contentLibrary.allTypes")}</option>{contentTypes.filter((value): value is LearningContentType => value !== "all").map((value) => <option key={value} value={value}>{t(typeLabels[value])}</option>)}</select></label>
        </div>
        {academicFiltersError && <p role="alert" className="mt-3 text-sm text-red-700">Academic filters could not be fully loaded. Refresh and try again.</p>}
      </section>
      {content.isPending || academicFiltersPending ? <div className="h-72 animate-pulse rounded-2xl bg-slate-200" /> : content.isError ? <ErrorState text={t("contentLibrary.loadError")} onRetry={() => void content.refetch()} retryLabel={t("contentLibrary.tryAgain")} /> : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-900">{t("contentLibrary.materials")}</h2><p className="mt-1 text-xs text-slate-500">{filteredContent.length} / {(content.data ?? []).length} {t("contentLibrary.items")}</p></div><button type="button" onClick={() => { void content.refetch(); void contentObjectiveMap.refetch(); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" title={t("contentLibrary.refresh")}><RefreshCw size={17} /></button></div>
          {filteredContent.length ? <div className="divide-y divide-slate-100">{filteredContent.map((item) => (
            <Link key={item.id} to={`/teacher/content/${item.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span>{item.code}</span><span>·</span><span>{t(typeLabels[item.contentType])}</span><span>·</span><span>{item.languageCode.toUpperCase()}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[...(academicSubjectIdsByContent.get(item.id) ?? [])].map((id) => {
                    const subject = (subjects.data ?? []).find((entry) => entry.id === id);
                    return subject ? <span key={id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{subject.name}</span> : null;
                  })}
                  {(academicGradeNamesByContent.get(item.id) ?? []).map((name) => <span key={`grade-${name}`} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">Grade: {name}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-3"><span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[item.status]}`}>{t(`contentLibrary.status.${item.status}`)}</span><ExternalLink size={16} className="text-slate-400" /></div>
            </Link>
          ))}</div> : <div className="px-5 py-12 text-center"><BookOpen size={28} className="mx-auto text-slate-300" /><p className="mt-3 font-medium text-slate-700">{t("contentLibrary.noMatching")}</p><p className="mt-1 text-sm text-slate-500">{t("contentLibrary.changeFilters")}</p></div>}
        </section>
      )}
    </div>
  );
}
function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>; }
function ErrorState({ text, onRetry, retryLabel }: { text: string; onRetry: () => void; retryLabel: string }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><p className="font-semibold">{text}</p><button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium"><RefreshCw size={16} />{retryLabel}</button></div>; }
