import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningGradebookService } from "@/features/learning-gradebook";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";

function csvCell(value: string): string {
  const safeValue = /^[=+@\-\t\r]/.test(value) ? "'" + value : value;
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
  const authorization = useAuthorization();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedClassGroupId, setSelectedClassGroupId] = useState("");
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");

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

  const gradesQuery = useQuery({
    queryKey: ["school-analytics", "term-grades", organizationId, termId],
    queryFn: () => learningGradebookService.listTermGrades({ termId }),
    enabled: Boolean(organizationId && termId && canManage),
  });
  const finalizedGrades = (gradesQuery.data ?? []).filter((grade) => grade.status === "finalized");
  const filteredFinalizedGrades = finalizedGrades.filter((grade) => visibleClassSubjects.some((subject) => subject.id === grade.classSubjectId));
  const rows = useMemo(() => visibleClassSubjects.map((subject) => {
    const grades = finalizedGrades.filter((grade) => grade.classSubjectId === subject.id);
    return {
      className: subject.className,
      classCode: subject.classCode,
      subjectName: subject.subjectName,
      classSubjectId: subject.id,
      finalizedCount: grades.length,
      averageScore: grades.length ? grades.reduce((total, grade) => total + (grade.overrideScore ?? grade.score), 0) / grades.length : null,
    };
  }), [visibleClassSubjects, finalizedGrades]);
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
  const loading = authLoading || authorization.loading || organizationsQuery.isPending
    || (Boolean(organizationId) && academicQuery.isPending)
    || (Boolean(academicYearId) && termsQuery.isPending)
    || (visibleClasses.length > 0 && classDataQuery.isPending)
    || (Boolean(termId) && gradesQuery.isPending)
    || (Boolean(organizationId) && assignmentSummaryQuery.isPending);
  const error = organizationsQuery.error || academicQuery.error || termsQuery.error || classDataQuery.error || gradesQuery.error || assignmentSummaryQuery.error;

  if (!user) return <main className="mx-auto max-w-6xl p-6">Sign in to view school analytics.</main>;
  if (authorization.loading || authLoading) return <main className="mx-auto max-w-6xl p-6"><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /></main>;
  if (!canManage) return <main className="mx-auto max-w-6xl p-6"><section role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h1 className="text-xl font-bold">School analytics access required</h1><p className="mt-2 text-sm">Your account needs the learning.academic.manage permission to view school-wide analytics.</p><Link to="/teacher" className="mt-4 inline-flex font-semibold underline">Return to workspace</Link></section></main>;
  if (organizationsQuery.isSuccess && organizations.length === 0) return <main className="mx-auto max-w-6xl p-6"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold text-slate-950">School analytics</h1><p className="mt-2 text-sm text-slate-600">No school is available for your account. Ask an owner or manager to confirm your active organisation membership and academic-management permission.</p><Link to="/school-admin" className="mt-4 inline-flex font-semibold underline">Return to school administration</Link></section></main>;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/school-admin" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← School administration</Link>
          <p className="mt-4 text-sm font-semibold text-indigo-700">School insights</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">School analytics</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">A live summary of active class membership and finalized term grades. Only saved, finalized grade records contribute to performance summaries.</p>
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
        )} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Export filtered CSV</button>
      </header>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <label className="text-sm font-medium text-slate-700">School / organization<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={organizationId} disabled={organizations.length <= 1} onChange={(event) => { setSelectedOrganizationId(event.target.value); setSelectedAcademicYearId(""); setSelectedTermId(""); setSelectedClassGroupId(""); setSelectedClassSubjectId(""); }}><option value="">Select school</option>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Academic year<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={academicYearId} onChange={(event) => { setSelectedAcademicYearId(event.target.value); setSelectedTermId(""); setSelectedClassGroupId(""); setSelectedClassSubjectId(""); }}>{years.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Term<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={termId} onChange={(event) => setSelectedTermId(event.target.value)}><option value="">Select term</option>{terms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Class<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" value={classGroupId} onChange={(event) => { setSelectedClassGroupId(event.target.value); setSelectedClassSubjectId(""); }}><option value="">All classes</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Activity from<input type="date" value={activityFrom} max={activityTo || undefined} onChange={(event) => setActivityFrom(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
        <label className="text-sm font-medium text-slate-700">Activity through<input type="date" value={activityTo} min={activityFrom || undefined} onChange={(event) => setActivityTo(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric label="Active students" value={studentIds.size.toLocaleString()} detail="Unique active student memberships in the filtered classes." />
        <Metric label="Active teachers" value={teacherIds.size.toLocaleString()} detail="Unique active teacher memberships in the filtered classes." />
        <Metric label="Active classes" value={visibleClasses.length.toLocaleString()} detail="Classes in the selected academic year and class filter." />
        <Metric label="Finalized term grades" value={filteredFinalizedGrades.length.toLocaleString()} detail="Finalized grade records for the filtered classes and subjects in the selected term." />
        <Metric label="Published assignments" value={(assignmentSummary?.publishedAssignments ?? 0).toLocaleString()} detail="Published assignments for the selected academic year, class and subject. Assignments are not term-linked." />
        <Metric label="Assignment completion" value={assignmentSummary?.completionRate === null || assignmentSummary?.completionRate === undefined ? "—" : assignmentSummary.completionRate.toFixed(1) + "%"} detail={assignmentSummary ? assignmentSummary.completionRate === null ? "No tracked progress records in this scope." : assignmentSummary.completedAssignmentRecords + " of " + assignmentSummary.trackedAssignmentRecords + " tracked records completed." : "Loading tracked assignment progress."} />
      </section>
      {assignmentSummary && <p className="text-xs text-slate-500">Assignment activity dates filter persisted progress by the organisation’s timezone. Progress completion excludes students without a tracked assignment record; the academic term filter applies to grade metrics only.</p>}
      {assignmentSummaryQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Assignment progress could not be loaded. Other school metrics may still be available; retry by refreshing the page.</p>}
      <section className="grid gap-3 lg:grid-cols-[1fr_2fr]">
        <Metric label="Average finalized score" value={averageScore === null ? "—" : averageScore.toFixed(1) + "%"} detail="Mean of finalized student term grades; empty grades are excluded." />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-950">Class and subject comparison</h2><p className="mt-1 text-sm text-slate-500">Only finalized grades are included. Subjects without finalized grades show no average.</p></div><label className="text-sm font-medium text-slate-700">Subject<select className="ml-2 rounded-xl border border-slate-300 bg-white px-3 py-2" value={selectedClassSubjectId} onChange={(event) => setSelectedClassSubjectId(event.target.value)}><option value="">All subjects</option>{classSubjects.map((item) => <option key={item.id} value={item.id}>{item.className} · {item.subjectName}</option>)}</select></label></div>
          {loading ? <p className="py-8 text-sm text-slate-500">Loading school data…</p> : error ? <p role="alert" className="py-8 text-sm text-rose-700">Analytics data could not be loaded. Check your access and retry.</p> : rows.length === 0 ? <p className="py-8 text-sm text-slate-500">No active classes or subjects match these filters.</p> : <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Class</th><th className="px-3 py-3">Subject</th><th className="px-3 py-3 text-right">Finalized grades</th><th className="px-3 py-3 text-right">Average score</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.classSubjectId}><td className="px-3 py-3 font-medium text-slate-900">{row.className} <span className="text-xs text-slate-500">{row.classCode}</span></td><td className="px-3 py-3">{row.subjectName}</td><td className="px-3 py-3 text-right tabular-nums">{row.finalizedCount}</td><td className="px-3 py-3 text-right tabular-nums">{row.averageScore === null ? "—" : row.averageScore.toFixed(1) + "%"}</td></tr>)}</tbody></table></div>}
        </div>
      </section>
      {organizationsQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">School list could not be loaded. Refresh to retry.</p>}
      {academicQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Academic years and classes could not be loaded. Refresh to retry.</p>}
      {termsQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Terms could not be loaded. Refresh to retry.</p>}
      {classDataQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Class membership and subject data could not be loaded. Refresh to retry.</p>}
      {gradesQuery.isError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Grade records could not be loaded. Check that gradebook migrations are applied and your account has access.</p>}
      <p className="text-xs text-slate-400">Data refreshes from the school database when the page loads. {gradesQuery.dataUpdatedAt ? "Grade data last refreshed " + new Date(gradesQuery.dataUpdatedAt).toLocaleString() + "." : ""}</p>
    </main>
  );
}
