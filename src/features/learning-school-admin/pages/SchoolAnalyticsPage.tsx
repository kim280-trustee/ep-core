import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/useTranslation";
import { LearningLanguageSelector } from "@/features/learning-shared/components/LearningLanguageSelector";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningGradebookService } from "@/features/learning-gradebook";
import { learningInterventionsService } from "@/features/learning-interventions";
import type { LearningInterventionCase, LearningInterventionPriority, LearningInterventionStatus } from "@/features/learning-interventions";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";

function csvCell(value: string): string {
  const safeValue = /^[\t\n\r ]*[=+\-@]/.test(value) ? "'" + value : value;
  return /[",\r\n]/.test(safeValue) ? '"' + safeValue.replace(/"/g, '""') + '"' : safeValue;
}

function exportCsv(
  rows: Array<{ className: string; subjectName: string; finalizedCount: number; averageScore: number | null }>,
  schoolName: string,
  termName: string,
  overview: Array<[string, string]>,
) {
  const values = [
    ["school", schoolName, "term", termName],
    ["overview metric", "value"],
    ...overview,
    [],
    ["class", "subject", "finalized student grades", "average finalized score (%)"],
    ...rows.map((row) => [row.className, row.subjectName, String(row.finalizedCount), row.averageScore === null ? "" : row.averageScore.toFixed(2)]),
  ];
  const csv = "\uFEFF" + values.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "school-analytics.csv";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-slate-950">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></article>;
}

export default function SchoolAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const authorization = useAuthorization();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");
  const [supportStatusFilter, setSupportStatusFilter] = useState<"all" | LearningInterventionStatus>("all");
  const [supportPriorityFilter, setSupportPriorityFilter] = useState<"all" | LearningInterventionPriority>("all");
  const [supportSearch, setSupportSearch] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-analytics", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId && organizations.some((item) => item.id === selectedOrganizationId)
    ? selectedOrganizationId : organizations[0]?.id ?? "";
  const organization = organizations.find((item) => item.id === organizationId);

  const academicQuery = useQuery({
    queryKey: ["school-analytics", "academic", organizationId],
    queryFn: async () => {
      const [years, classes, subjects] = await Promise.all([
        learningAcademicService.listAcademicYears(organizationId),
        learningAcademicService.listClassGroups(organizationId),
        learningAcademicService.listSubjects(),
      ]);
      return { years, classes: classes.filter((item) => item.status === "active"), subjects };
    },
    enabled: Boolean(organizationId && canManage),
  });
  const years = academicQuery.data?.years ?? [];
  const academicYearId = selectedAcademicYearId && years.some((item) => item.id === selectedAcademicYearId)
    ? selectedAcademicYearId : years[0]?.id ?? "";
  const classes = (academicQuery.data?.classes ?? []).filter((item) => !academicYearId || item.academicYearId === academicYearId);
  const classGroupId = selectedClassGroupId && classes.some((item) => item.id === selectedClassGroupId)
    ? selectedClassGroupId : "";
  const visibleClasses = classGroupId ? classes.filter((item) => item.id === classGroupId) : classes;

  const termsQuery = useQuery({
    queryKey: ["school-analytics", "terms", organizationId, academicYearId],
    queryFn: () => learningAcademicService.listTerms(organizationId, academicYearId),
    enabled: Boolean(organizationId && academicYearId && canManage),
  });
  const terms = termsQuery.data ?? [];
  const termId = selectedTermId && terms.some((item) => item.id === selectedTermId)
    ? selectedTermId : terms[0]?.id ?? "";
  const term = terms.find((item) => item.id === termId);

  const classDataQuery = useQuery({
    queryKey: ["school-analytics", "class-data", organizationId, visibleClasses.map((item) => item.id).join(",")],
    queryFn: async () => Promise.all(visibleClasses.map(async (group) => {
      const [members, subjects] = await Promise.all([
        learningEnrollmentService.listClassMembers(group.id),
        learningAcademicService.listClassSubjects(organizationId, group.id),
      ]);
      return { group, members, subjects: subjects.filter((subject) => subject.status === "active") };
    })),
    enabled: Boolean(organizationId && visibleClasses.length && canManage),
  });
  const classData = classDataQuery.data ?? [];
  const subjectNames = new Map((academicQuery.data?.subjects ?? []).map((subject) => [subject.id, subject.name]));
  const classSubjects = classData.flatMap(({ group, subjects }) => subjects.map((subject) => ({
    ...subject,
    className: group.name,
    classCode: group.code,
    classGroupId: group.id,
    subjectName: subjectNames.get(subject.subjectId) ?? subject.subjectId,
  })));
  const validClassSubjectId = classSubjects.some((item) => item.id === selectedClassSubjectId) ? selectedClassSubjectId : "";
  const visibleClassSubjects = validClassSubjectId
    ? classSubjects.filter((item) => item.id === validClassSubjectId) : classSubjects;

  const supportCasesQuery = useQuery({
    queryKey: ["school-analytics", "support-cases", organizationId, visibleClasses.map((item) => item.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(visibleClasses.map((group) => learningInterventionsService.listCases(group.id)));
      const uniqueCases = new Map<string, LearningInterventionCase>();
      results.flat().forEach((item) => uniqueCases.set(item.id, item));
      return [...uniqueCases.values()];
    },
    enabled: Boolean(organizationId && canManage),
    staleTime: 30_000,
  });

  const gradesQuery = useQuery({
    queryKey: ["school-analytics", "term-grades", organizationId, termId],
    queryFn: () => learningGradebookService.listTermGrades({ termId }),
    enabled: Boolean(organizationId && termId && canManage),
  });
  const finalizedGrades = (gradesQuery.data ?? []).filter((grade) => grade.status === "finalized");
  const filteredFinalizedGrades = finalizedGrades.filter((grade) => visibleClassSubjects.some((subject) => subject.id === grade.classSubjectId));
  const rows = visibleClassSubjects.map((subject) => {
    const grades = finalizedGrades.filter((grade) => grade.classSubjectId === subject.id);
    return {
      className: subject.className,
      classCode: subject.classCode,
      subjectName: subject.subjectName,
      classSubjectId: subject.id,
      finalizedCount: grades.length,
      averageScore: grades.length ? grades.reduce((total, grade) => total + (grade.overrideScore ?? grade.score), 0) / grades.length : null,
    };
  });
  const assignmentSummaryQuery = useQuery({
    queryKey: ["school-analytics", "assignment-progress", organizationId, academicYearId, classGroupId, validClassSubjectId, activityFrom, activityTo],
    queryFn: () => learningSchoolAdminService.getAnalyticsSummary({
      organizationId,
      academicYearId: academicYearId || undefined,
      classGroupId: classGroupId || undefined,
      classSubjectId: validClassSubjectId || undefined,
      activityFrom: activityFrom || undefined,
      activityTo: activityTo || undefined,
      timezone: organization?.timezone || "UTC",
    }),
    enabled: Boolean(organizationId && canManage && academicQuery.isSuccess),
  });
  const assignmentSummary = assignmentSummaryQuery.data;
  const studentIds = new Set(classData.flatMap(({ members }) => members.filter((member) => member.membershipType === "student" && member.status === "active").map((member) => member.userId)));
  const teacherIds = new Set(classData.flatMap(({ members }) => members.filter((member) => member.membershipType === "teacher" && member.status === "active").map((member) => member.userId)));
  const gradeScores = filteredFinalizedGrades.map((grade) => grade.overrideScore ?? grade.score);
  const averageScore = gradeScores.length ? gradeScores.reduce((sum, score) => sum + score, 0) / gradeScores.length : null;
  const supportCases = supportCasesQuery.data ?? [];
  const todayInOrganization = new Intl.DateTimeFormat("en-CA", { timeZone: organization?.timezone || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const openSupportCases = supportCases.filter((item) => item.status !== "resolved");
  const highPrioritySupportCases = openSupportCases.filter((item) => item.priority === "high");
  const overdueSupportCases = openSupportCases.filter((item) => item.reviewDate !== null && item.reviewDate < todayInOrganization);
  const visibleSupportCases = supportCases.filter((item) => {
    const matchesStatus = supportStatusFilter === "all" || item.status === supportStatusFilter;
    const matchesPriority = supportPriorityFilter === "all" || item.priority === supportPriorityFilter;
    const search = supportSearch.trim().toLocaleLowerCase();
    const matchesSearch = !search || [item.studentName, item.className, item.classCode, item.title, item.notes, item.evidenceReference ?? ""].some((value) => value.toLocaleLowerCase().includes(search));
    return matchesStatus && matchesPriority && matchesSearch;
  });
  const exportSupportCases = () => {
    const rows = [
      ["class", "class_code", "student", "case", "priority", "status", "review_date", "evidence_reference", "notes", "outcome"],
      ...visibleSupportCases.map((item) => [item.className, item.classCode, item.studentName, item.title, item.priority, item.status, item.reviewDate ?? "", item.evidenceReference ?? "", item.notes, item.outcome ?? ""]),
    ];
    const csv = "\\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\\r\\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "school-support-follow-ups.csv";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const supportStatusLabel = (status: LearningInterventionStatus) => status === "in_progress" ? t("schoolAnalytics.supportInProgress") : status === "resolved" ? t("schoolAnalytics.supportResolved") : t("schoolAnalytics.supportOpen");
  const supportPriorityLabel = (priority: LearningInterventionPriority) => priority === "high" ? t("schoolAnalytics.supportHigh") : priority === "low" ? t("schoolAnalytics.supportLow") : t("schoolAnalytics.supportNormal");
  const loading = authLoading || authorization.loading || organizationsQuery.isPending
    || (Boolean(organizationId) && academicQuery.isPending)
    || (Boolean(academicYearId) && termsQuery.isPending)
    || (visibleClasses.length > 0 && classDataQuery.isPending)
    || (Boolean(termId) && gradesQuery.isPending)
    || (Boolean(organizationId) && assignmentSummaryQuery.isPending);
  const error = organizationsQuery.error || academicQuery.error || termsQuery.error || classDataQuery.error || gradesQuery.error || assignmentSummaryQuery.error;

  if (!user) return <main className="mx-auto max-w-6xl p-6">{t("schoolAnalytics.signIn")}</main>;
  if (authorization.loading || authLoading) return <main className="mx-auto max-w-6xl p-6"><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /></main>;
  if (!canManage) return <main className="mx-auto max-w-6xl p-6"><section role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h1 className="text-xl font-bold">{t("schoolAdmin.accessRequired")}</h1><p className="mt-2 text-sm">{t("schoolAnalytics.permissionDescription")}</p><Link to="/teacher" className="mt-4 inline-flex font-semibold underline">{t("learning.teacherWorkspace")}</Link></section></main>;
  if (organizationsQuery.isSuccess && organizations.length === 0) return <main className="mx-auto max-w-6xl p-6"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold text-slate-950">{t("schoolAnalytics.title")}</h1><p className="mt-2 text-sm text-slate-600">{t("schoolAnalytics.noSchool")}</p><Link to="/school-admin" className="mt-4 inline-flex font-semibold underline">{t("schoolAdmin.return")}</Link></section></main>;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex justify-end"><LearningLanguageSelector compact /></div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/school-admin" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← {t("schoolAdmin.setup")}</Link>
          <p className="mt-4 text-sm font-semibold text-indigo-700">{t("schoolAdmin.schoolInsights")}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{t("schoolAnalytics.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("schoolAnalytics.description")}</p>
        </div>
        <button type="button" disabled={!rows.length || loading} onClick={() => exportCsv(
          rows.map((row) => ({ className: row.className, subjectName: row.subjectName, finalizedCount: row.finalizedCount, averageScore: row.averageScore })),
          organization?.name ?? "School",
          term?.name ?? "",
          [
            ["Academic year", years.find((item) => item.id === academicYearId)?.name ?? "All academic years"],
            ["Class filter", classes.find((item) => item.id === classGroupId)?.name ?? "All classes"],
            ["Subject filter", classSubjects.find((item) => item.id === validClassSubjectId)?.subjectName ?? "All subjects"],
            ["Active students", String(studentIds.size)],
            ["Active teachers", String(teacherIds.size)],
            ["Active classes", String(visibleClasses.length)],
            ["Finalized term grades", String(filteredFinalizedGrades.length)],
            ["Average finalized score (%)", averageScore === null ? "No finalized grades" : averageScore.toFixed(2)],
            ["Published assignments", String(assignmentSummary?.publishedAssignments ?? 0)],
            ["Tracked assignment progress", String(assignmentSummary?.trackedAssignmentRecords ?? 0)],
            ["Completed tracked assignments", String(assignmentSummary?.completedAssignmentRecords ?? 0)],
            ["Assignment completion rate", assignmentSummary?.completionRate === null || assignmentSummary?.completionRate === undefined ? "No tracked progress" : assignmentSummary.completionRate.toFixed(2) + "%"],
            ["Activity from", activityFrom || "Any date"],
            ["Activity through", activityTo || "Any date"],
          ],
        )} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{t("schoolAnalytics.exportFiltered")}</button>
      </header>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.schoolOrganization")}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={organizationId} disabled={organizations.length <= 1} onChange={(event) => { setSelectedOrganizationId(event.target.value); setSelectedAcademicYearId(""); setSelectedTermId(""); setSelectedClassGroupId(""); setSelectedClassSubjectId(""); }}><option value="">{t("schoolAdmin.selectSchool")}</option>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">{t("schoolSetup.academicYears")}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={academicYearId} onChange={(event) => { setSelectedAcademicYearId(event.target.value); setSelectedTermId(""); setSelectedClassGroupId(""); setSelectedClassSubjectId(""); }}>{years.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.term")}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={termId} onChange={(event) => setSelectedTermId(event.target.value)}><option value="">{t("schoolAnalytics.selectTerm")}</option>{terms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">{t("schoolAdmin.class")}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={classGroupId} onChange={(event) => { setSelectedClassGroupId(event.target.value); setSelectedClassSubjectId(""); }}><option value="">{t("schoolAnalytics.allClasses")}</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.assignmentSubject")}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={validClassSubjectId} disabled={classDataQuery.isPending || classSubjects.length === 0} onChange={(event) => setSelectedClassSubjectId(event.target.value)}><option value="">{classDataQuery.isPending ? t("schoolAnalytics.loadingSubjects") : classSubjects.length === 0 ? t("schoolAnalytics.noActiveSubjects") : t("schoolAnalytics.allSubjects")}</option>{classSubjects.map((item) => <option key={item.id} value={item.id}>{item.className} · {item.subjectName}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.activityFrom")}<input type="date" value={activityFrom} max={activityTo || undefined} onChange={(event) => setActivityFrom(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
        <label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.activityThrough")}<input type="date" value={activityTo} min={activityFrom || undefined} onChange={(event) => setActivityTo(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric label={t("schoolAnalytics.activeStudents")} value={studentIds.size.toLocaleString()} detail={t("schoolAnalytics.activeStudentsDetail")} />
        <Metric label={t("schoolAnalytics.activeTeachers")} value={teacherIds.size.toLocaleString()} detail={t("schoolAnalytics.activeTeachersDetail")} />
        <Metric label={t("schoolAnalytics.activeClasses")} value={visibleClasses.length.toLocaleString()} detail={t("schoolAnalytics.activeClassesDetail")} />
        <Metric label={t("schoolAnalytics.finalizedTermGrades")} value={filteredFinalizedGrades.length.toLocaleString()} detail={t("schoolAnalytics.finalizedTermGradesDetail")} />
        <Metric label={t("schoolAnalytics.publishedAssignments")} value={(assignmentSummary?.publishedAssignments ?? 0).toLocaleString()} detail={t("schoolAnalytics.publishedAssignmentsDetail")} />
        <Metric label={t("schoolAnalytics.assignmentCompletion")} value={assignmentSummary?.completionRate === null || assignmentSummary?.completionRate === undefined ? "—" : assignmentSummary.completionRate.toFixed(1) + "%"} detail={assignmentSummary ? assignmentSummary.completionRate === null ? t("schoolAnalytics.noTrackedProgress") : assignmentSummary.completedAssignmentRecords + " " + t("schoolAnalytics.of") + " " + assignmentSummary.trackedAssignmentRecords + " " + t("schoolAnalytics.trackedCompleted") : t("schoolAnalytics.loadingProgress")} />
      </section>
      {assignmentSummary && <p className="text-xs text-slate-500">{t("schoolAnalytics.assignmentActivityNote")}</p>}
      {assignmentSummaryQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.assignmentProgressError")}</p>}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-950">{t("schoolAnalytics.supportCasesTitle")}</h2><p className="mt-1 max-w-3xl text-sm text-slate-500">{t("schoolAnalytics.supportCasesDescription")}</p></div><button type="button" onClick={exportSupportCases} disabled={!visibleSupportCases.length || supportCasesQuery.isPending} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">{t("schoolAnalytics.supportCasesExport")}</button></div>
        <div className="grid gap-3 sm:grid-cols-3"><Metric label={t("schoolAnalytics.supportOpen")} value={openSupportCases.length} detail={t("schoolAnalytics.supportOpenDetail")} /><Metric label={t("schoolAnalytics.supportHighPriority")} value={highPrioritySupportCases.length} detail={t("schoolAnalytics.supportHighPriorityDetail")} /><Metric label={t("schoolAnalytics.supportOverdue")} value={overdueSupportCases.length} detail={t("schoolAnalytics.supportOverdueDetail")} /></div>
        <div className="grid gap-3 md:grid-cols-3"><label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.supportCasesSearch")}<input value={supportSearch} onChange={(event) => setSupportSearch(event.target.value)} placeholder={t("schoolAnalytics.supportCasesSearchPlaceholder")} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label><label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.supportStatusFilter")}<select value={supportStatusFilter} onChange={(event) => setSupportStatusFilter(event.target.value as "all" | LearningInterventionStatus)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"><option value="all">{t("schoolAnalytics.supportAll")}</option><option value="open">{t("schoolAnalytics.supportOpen")}</option><option value="in_progress">{t("schoolAnalytics.supportInProgress")}</option><option value="resolved">{t("schoolAnalytics.supportResolved")}</option></select></label><label className="text-sm font-medium text-slate-700">{t("schoolAnalytics.supportPriorityFilter")}<select value={supportPriorityFilter} onChange={(event) => setSupportPriorityFilter(event.target.value as "all" | LearningInterventionPriority)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"><option value="all">{t("schoolAnalytics.supportAll")}</option><option value="high">{t("schoolAnalytics.supportHigh")}</option><option value="normal">{t("schoolAnalytics.supportNormal")}</option><option value="low">{t("schoolAnalytics.supportLow")}</option></select></label></div>
        {supportCasesQuery.isPending && <p className="py-6 text-sm text-slate-500">{t("schoolAnalytics.supportCasesLoading")}</p>}
        {supportCasesQuery.isError && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.supportCasesLoadError")}</p>}
        {!supportCasesQuery.isPending && !supportCasesQuery.isError && visibleSupportCases.length === 0 && <p className="py-6 text-sm text-slate-500">{t("schoolAnalytics.supportCasesNone")}</p>}
        {!supportCasesQuery.isPending && !supportCasesQuery.isError && visibleSupportCases.length > 0 && <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">{t("schoolAnalytics.supportStudent")}</th><th className="px-3 py-3">{t("schoolAdmin.class")}</th><th className="px-3 py-3">{t("schoolAnalytics.supportCase")}</th><th className="px-3 py-3">{t("schoolAnalytics.supportPriorityFilter")}</th><th className="px-3 py-3">{t("schoolAnalytics.supportStatusFilter")}</th><th className="px-3 py-3">{t("schoolAnalytics.supportReviewDate")}</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleSupportCases.slice(0, 100).map((item) => <tr key={item.id}><td className="px-3 py-3 font-medium text-slate-900">{item.studentName}</td><td className="px-3 py-3">{item.className} <span className="text-xs text-slate-500">{item.classCode}</span></td><td className="max-w-sm px-3 py-3"><p className="font-medium text-slate-900">{item.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.notes}</p></td><td className="px-3 py-3">{supportPriorityLabel(item.priority)}</td><td className="px-3 py-3">{supportStatusLabel(item.status)}</td><td className="whitespace-nowrap px-3 py-3">{item.reviewDate ?? t("schoolAnalytics.supportNoReviewDate")}{item.status !== "resolved" && item.reviewDate !== null && item.reviewDate < todayInOrganization ? <span className="ml-2 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">{t("schoolAnalytics.supportOverdue")}</span> : null}</td></tr>)}</tbody></table><p className="mt-3 text-xs text-slate-500">{t("schoolAnalytics.supportCasesNotice")} {visibleSupportCases.length > 100 ? " " + t("schoolAnalytics.supportCasesFirst100") : ""}</p></div>}
      </section>
      <section className="grid gap-3 lg:grid-cols-[1fr_2fr]">
        <Metric label={t("schoolAnalytics.averageFinalizedScore")} value={averageScore === null ? "—" : averageScore.toFixed(1) + "%"} detail={t("schoolAnalytics.averageFinalizedScoreDetail")} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-950">{t("schoolAnalytics.classSubjectComparison")}</h2><p className="mt-1 text-sm text-slate-500">{t("schoolAnalytics.classSubjectComparisonHelp")}</p></div></div>
          {loading ? <p className="py-8 text-sm text-slate-500">{t("schoolAnalytics.loadingSchoolData")}</p> : error ? <p role="alert" className="py-8 text-sm text-rose-700">{t("schoolAnalytics.analyticsLoadError")}</p> : rows.length === 0 ? <p className="py-8 text-sm text-slate-500">{t("schoolAnalytics.noClassesSubjects")}</p> : <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">{t("schoolAdmin.class")}</th><th className="px-3 py-3">{t("schoolAnalytics.subject")}</th><th className="px-3 py-3 text-right">{t("schoolAnalytics.finalizedGrades")}</th><th className="px-3 py-3 text-right">{t("schoolAnalytics.averageScore")}</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.classSubjectId}><td className="px-3 py-3 font-medium text-slate-900">{row.className} <span className="text-xs text-slate-500">{row.classCode}</span></td><td className="px-3 py-3">{row.subjectName}</td><td className="px-3 py-3 text-right tabular-nums">{row.finalizedCount}</td><td className="px-3 py-3 text-right tabular-nums">{row.averageScore === null ? "—" : row.averageScore.toFixed(1) + "%"}</td></tr>)}</tbody></table></div>}
        </div>
      </section>
      {organizationsQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.schoolListError")}</p>}
      {academicQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.academicLoadError")}</p>}
      {termsQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.termsLoadError")}</p>}
      {classDataQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.classDataLoadError")}</p>}
      {gradesQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{t("schoolAnalytics.gradeRecordsLoadError")}</p>}
      {supportCasesQuery.isError && <p className="sr-only">{t("schoolAnalytics.supportCasesLoadError")}</p>}
      <p className="text-xs text-slate-400">{t("schoolAnalytics.dataRefreshNote")} {gradesQuery.dataUpdatedAt ? t("schoolAnalytics.gradeDataLastRefreshed") + " " + new Date(gradesQuery.dataUpdatedAt).toLocaleString() + "." : ""}</p>
    </main>
  );
}
