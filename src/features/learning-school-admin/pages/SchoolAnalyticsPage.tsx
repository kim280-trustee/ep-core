import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, BarChart3, BookOpen, Download, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningAcademicService } from "@/features/learning-academic";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";

function csvCell(value: string | number) {
  const text = String(value);
  // Quoting alone does not prevent spreadsheet formula execution.
  const safeText = /^\s*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function downloadSummaryCsv(rows: Array<[string, string | number]>, organizationName: string) {
  const csv = ["Metric,Value", ...rows.map(([label, value]) => `${csvCell(label)},${csvCell(value)}`)].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `school-analytics-${organizationName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "report"}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function SchoolAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const authorization = useAuthorization();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [organizationChoice, setOrganizationChoice] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classGroupId, setClassGroupId] = useState("");
  const [classSubjectId, setClassSubjectId] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");

  const organizationsQuery = useQuery({
    queryKey: ["school-analytics", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id && !authLoading && !authorization.loading && canManage),
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = organizations.some((item) => item.id === organizationChoice)
    ? organizationChoice
    : organizations[0]?.id ?? "";
  const organization = organizations.find((item) => item.id === organizationId);

  const yearsQuery = useQuery({
    queryKey: ["school-analytics", "academic-years", organizationId],
    queryFn: () => learningAcademicService.listAcademicYears(organizationId),
    enabled: Boolean(organizationId && canManage),
  });
  const years = yearsQuery.data ?? [];
  const validYearId = years.some((year) => year.id === academicYearId) ? academicYearId : "";

  const classesQuery = useQuery({
    queryKey: ["school-analytics", "classes", organizationId, validYearId],
    queryFn: () => learningAcademicService.listClassGroups(organizationId, validYearId),
    enabled: Boolean(organizationId && canManage),
  });
  const classes = (classesQuery.data ?? []).filter((item) => item.status === "active");
  const validClassId = classes.some((item) => item.id === classGroupId) ? classGroupId : "";

  const classSubjectsQuery = useQuery({
    queryKey: ["school-analytics", "class-subjects", organizationId, validClassId],
    queryFn: () => learningAcademicService.listClassSubjects(organizationId, validClassId),
    enabled: Boolean(organizationId && validClassId && canManage),
  });
  const subjectsQuery = useQuery({
    queryKey: ["school-analytics", "subjects"],
    queryFn: () => learningAcademicService.listSubjects(),
    enabled: Boolean(canManage),
  });
  const subjectOptions = (classSubjectsQuery.data ?? [])
    .filter((item) => item.status === "active")
    .map((item) => ({ ...item, subject: subjectsQuery.data?.find((subject) => subject.id === item.subjectId) }))
    .filter((item) => Boolean(item.subject));
  const validClassSubjectId = subjectOptions.some((item) => item.id === classSubjectId) ? classSubjectId : "";

  const summaryQuery = useQuery({
    queryKey: ["school-analytics", "summary", organizationId, validYearId, validClassId, validClassSubjectId, activityFrom, activityTo],
    queryFn: () => learningSchoolAdminService.getAnalyticsSummary({
      organizationId,
      academicYearId: validYearId || undefined,
      classGroupId: validClassId || undefined,
      classSubjectId: validClassSubjectId || undefined,
      activityFrom: activityFrom || undefined,
      activityTo: activityTo || undefined,
    }),
    enabled: Boolean(organizationId && canManage && !organizationsQuery.isError),
  });

  const summary = summaryQuery.data;
  const exportRows: Array<[string, string | number]> = summary ? [
    ["Organization", organization?.name ?? "Selected organization"],
    ["Academic year", years.find((year) => year.id === validYearId)?.name ?? "All years"],
    ["Class", classes.find((item) => item.id === validClassId)?.name ?? "All active classes"],
    ["Assignment subject", subjectOptions.find((item) => item.id === validClassSubjectId)?.subject?.name ?? "All subjects"],
    ["Activity from", activityFrom || "Any date"],
    ["Activity through", activityTo || "Any date"],
    ["Active students", summary.activeStudents],
    ["Active teachers", summary.activeTeachers],
    ["Active classes", summary.activeClasses],
    ["Published assignments", summary.publishedAssignments],
    ["Tracked assignment progress records", summary.trackedAssignmentRecords],
    ["Completed tracked assignment records", summary.completedAssignmentRecords],
    ["Completion rate among tracked records", summary.completionRate === null ? "No tracked progress yet" : `${summary.completionRate.toFixed(1)}%`],
    ["Incomplete tracked assignment records", summary.incompleteAssignmentRecords],
    ["Refreshed at", summary.refreshedAt],
  ] : [];

  if (authLoading || authorization.loading) return <div className="mx-auto max-w-7xl p-8"><div className="h-40 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (!user) return <div className="mx-auto max-w-4xl p-8">Sign in to access school analytics.</div>;
  if (!canManage) return <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-amber-950"><h1 className="text-xl font-semibold">School analytics access required</h1><p className="mt-2 text-sm">Your account needs the learning.academic.manage permission to view organisation-wide reports.</p><Link className="mt-4 inline-block text-sm font-semibold underline" to="/teacher">Return to teaching workspace</Link></div>;

  return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <Link to="/school-admin" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={16} /> Back to school setup</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-slate-300">E&P Learning · School management</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">School analytics</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">A live summary of active membership, classes and published assignment progress. Figures are calculated from records visible to your authorised account.</p></div>
        <button type="button" disabled={!summary || summaryQuery.isFetching} onClick={() => downloadSummaryCsv(exportRows, organization?.name ?? "school")} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} /> Export CSV</button>
      </div>
    </header>

    {organizationsQuery.isError ? <ErrorPanel message="Your manageable schools could not be loaded. Check your school administration permission and retry." /> : null}
    {!organizationsQuery.isPending && !organizations.length && !organizationsQuery.isError ? <EmptyPanel title="No manageable school found" detail="An active school membership with the required administration permission is needed before school analytics can be shown." /> : null}

    {organizations.length > 0 && <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
      <label className="text-sm font-medium text-slate-700">School / organization<select value={organizationId} onChange={(event) => { setOrganizationChoice(event.target.value); setAcademicYearId(""); setClassGroupId(""); setClassSubjectId(""); }} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="">Select school</option>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Academic year<select value={validYearId} onChange={(event) => { setAcademicYearId(event.target.value); setClassGroupId(""); setClassSubjectId(""); }} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="">All academic years</option>{years.map((year) => <option key={year.id} value={year.id}>{year.name} ({year.code})</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Class<select value={validClassId} onChange={(event) => { setClassGroupId(event.target.value); setClassSubjectId(""); }} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="">All active classes</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Assignment subject (choose a class first)<select value={validClassSubjectId} onChange={(event) => setClassSubjectId(event.target.value)} disabled={!validClassId || classSubjectsQuery.isPending || subjectsQuery.isPending} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 disabled:bg-slate-100"><option value="">All subjects</option>{subjectOptions.map((item) => <option key={item.id} value={item.id}>{item.subject?.name} ({item.subject?.code})</option>)}</select></label>
      <label className="text-sm font-medium text-slate-700">Activity from<input type="date" value={activityFrom} max={activityTo || undefined} onChange={(event) => setActivityFrom(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
      <label className="text-sm font-medium text-slate-700">Activity through<input type="date" value={activityTo} min={activityFrom || undefined} onChange={(event) => setActivityTo(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5" /></label>
    </section>}

    {(yearsQuery.isError || classesQuery.isError || summaryQuery.isError) && <ErrorPanel message="Some school analytics could not be loaded. Verify that you can access the selected school, academic year and class, then retry." />}
    {(summaryQuery.isPending || yearsQuery.isPending || classesQuery.isPending) && organizationId && <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />}
    {summary && !summaryQuery.isError && <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Users size={18} />} label="Active students" value={summary.activeStudents} detail="Unique active student memberships in this filter" />
        <Metric icon={<GraduationCap size={18} />} label="Active teachers" value={summary.activeTeachers} detail="Unique active teacher memberships in this filter" />
        <Metric icon={<BookOpen size={18} />} label="Active classes" value={summary.activeClasses} detail="Active classes for the selected academic scope" />
        <Metric icon={<BarChart3 size={18} />} label="Published assignments" value={summary.publishedAssignments} detail="Published assignments in the selected scope" />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Assignment progress</h2><p className="mt-1 text-sm text-slate-500">Completion uses tracked progress records for published assignments only; when an activity date range is set, only records with activity in that range are counted. Students without a progress record are not counted in this rate.</p></div><span className="text-xs text-slate-500">Refreshed {new Date(summary.refreshedAt).toLocaleString()}</span></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Completion rate (tracked)</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.completionRate === null ? "—" : `${summary.completionRate.toFixed(1)}%`}</p><p className="mt-1 text-xs text-slate-500">{summary.completionRate === null ? "No progress records yet" : `${summary.completedAssignmentRecords} of ${summary.trackedAssignmentRecords} tracked records completed`}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Completed records</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.completedAssignmentRecords}</p><p className="mt-1 text-xs text-slate-500">Persisted completed progress status</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Incomplete tracked records</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.incompleteAssignmentRecords}</p><p className="mt-1 text-xs text-slate-500">Tracked records not marked completed</p></div>
        </div>
        {summary.completionRate === null && <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">No tracked assignment progress exists in this filter yet. This is an empty state, not a zero-percent performance score.</p>}
      </section>
    </div>}
  </main>;
}

function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: number; detail: string }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></section>;
}

function ErrorPanel({ message }: { message: string }) {
  return <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={18} className="mt-0.5 shrink-0" />{message}</div>;
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-6"><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-600">{detail}</p></div>;
}
