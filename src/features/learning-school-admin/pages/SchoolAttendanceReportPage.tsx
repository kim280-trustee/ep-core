import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { useAuthorization } from "@/features/auth/authorization/useAuthorization";
import { learningSchoolAdminService } from "../services/learning-school-admin.service";
import { learningAttendanceService } from "../services/learning-attendance.service";
import type { SchoolAttendanceReportRow } from "../types/learning-attendance.types";

function localDateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function csvCell(value: string): string {
  const safeValue = /^[=+@\-\t\r]/.test(value) ? "'" + value : value;
  return /[",\r\n]/.test(safeValue) ? '"' + safeValue.replace(/"/g, '""') + '"' : safeValue;
}

function exportCsv(rows: SchoolAttendanceReportRow[], schoolName: string, startDate: string, endDate: string) {
  const values = [
    ["school", schoolName, "start_date", startDate, "end_date", endDate],
    ["class_code", "class_name", "attendance_date", "present", "absent", "late", "excused", "marked"],
    ...rows.map((row) => [
      row.classCode,
      row.className,
      row.attendanceDate,
      String(row.presentCount),
      String(row.absentCount),
      String(row.lateCount),
      String(row.excusedCount),
      String(row.markedCount),
    ]),
  ];
  const csv = "\uFEFF" + values.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `school-attendance-${startDate}-to-${endDate}.csv`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function SchoolAttendanceReportPage() {
  const { user, loading: authLoading } = useAuth();
  const authorization = useAuthorization();
  const canManage = authorization.hasPermission("learning.academic.manage");
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const today = localDateValue(new Date());
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 29);
  const [startDate, setStartDate] = useState(() => localDateValue(monthAgo));
  const [endDate, setEndDate] = useState(today);

  const organizationsQuery = useQuery({
    queryKey: ["school-attendance-report", "organizations", user?.id],
    queryFn: () => learningSchoolAdminService.listManageableOrganizations(user!.id),
    enabled: Boolean(user?.id) && !authLoading && !authorization.loading && canManage,
  });
  const organizations = organizationsQuery.data ?? [];
  const organizationId = selectedOrganizationId && organizations.some((item) => item.id === selectedOrganizationId)
    ? selectedOrganizationId
    : organizations[0]?.id ?? "";
  const organization = organizations.find((item) => item.id === organizationId);

  const reportQuery = useQuery({
    queryKey: ["school-attendance-report", organizationId, startDate, endDate],
    queryFn: () => learningAttendanceService.getSchoolWideHistory(organizationId, startDate, endDate),
    enabled: Boolean(organizationId && startDate && endDate && startDate <= endDate && canManage),
  });

  const rows = reportQuery.data ?? [];
  const totals = useMemo(() => rows.reduce((result, row) => ({
    present: result.present + row.presentCount,
    absent: result.absent + row.absentCount,
    late: result.late + row.lateCount,
    excused: result.excused + row.excusedCount,
    marked: result.marked + row.markedCount,
    registers: result.registers + 1,
  }), { present: 0, absent: 0, late: 0, excused: 0, marked: 0, registers: 0 }), [rows]);

  if (!user) return <main className="mx-auto max-w-6xl p-6">Sign in to view school attendance reports.</main>;
  if (authorization.loading || organizationsQuery.isPending) return <main className="mx-auto max-w-6xl space-y-4 p-6"><div className="h-8 w-64 animate-pulse rounded bg-slate-200" /><div className="h-32 animate-pulse rounded-2xl bg-slate-100" /></main>;
  if (organizationsQuery.isSuccess && organizations.length === 0) return <main className="mx-auto max-w-6xl p-6"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold text-slate-950">School-wide attendance</h1><p className="mt-2 text-sm leading-6 text-slate-600">No school is available for your account yet. Ask a school administrator to confirm your organization membership and academic-management permission.</p><Link className="mt-4 inline-flex font-semibold underline" to="/school-admin">Return to School Administration</Link></section></main>;
  if (!canManage) return <main className="mx-auto max-w-6xl p-6"><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900" role="alert"><h1 className="text-lg font-semibold">School attendance report</h1><p className="mt-2 text-sm">You need academic-management permission to view school-wide attendance.</p><Link className="mt-4 inline-flex font-semibold underline" to="/school-admin">Return to School Administration</Link></section></main>;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/school-admin" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← School Administration</Link>
          <p className="mt-4 text-sm font-semibold text-indigo-700">School insights</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">School-wide attendance</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Review saved attendance marks across classes and export a date-scoped report. Unmarked students are not counted as present or absent.</p>
        </div>
        <button type="button" disabled={!rows.length || reportQuery.isFetching} onClick={() => exportCsv(rows, organization?.name ?? "School", startDate, endDate)} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Export CSV</button>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 sm:p-5">
        <label className="text-sm font-medium text-slate-700">School / organization
          <select value={organizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" disabled={organizations.length <= 1}>
            {organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">From
          <input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
        </label>
        <label className="text-sm font-medium text-slate-700">To
          <input type="date" value={endDate} min={startDate} max={today} onChange={(event) => setEndDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" required />
        </label>
      </section>

      {organizationsQuery.isError && <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">School list could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void organizationsQuery.refetch()}>Try again</button></section>}
      {reportQuery.isError && <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">Attendance report could not be loaded. Check your access and date range, then retry. <button type="button" className="font-semibold underline" onClick={() => void reportQuery.refetch()}>Try again</button></section>}
      {organizationId && reportQuery.isPending && <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading saved attendance…</section>}

      {!reportQuery.isPending && !reportQuery.isError && <>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Summary label="Registers" value={totals.registers} />
          <Summary label="Present" value={totals.present} />
          <Summary label="Absent" value={totals.absent} />
          <Summary label="Late" value={totals.late} />
          <Summary label="Excused" value={totals.excused} />
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="font-semibold text-slate-950">Class and date breakdown</h2><p className="mt-1 text-sm text-slate-500">{rows.length} saved class-date registers</p></div>
          {rows.length === 0 ? <div className="p-8 text-center"><p className="font-semibold text-slate-800">No attendance records in this date range.</p><p className="mt-1 text-sm text-slate-500">Try a wider date range or confirm that attendance has been saved.</p></div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Class</th><th className="px-4 py-3 text-right">Present</th><th className="px-4 py-3 text-right">Absent</th><th className="px-4 py-3 text-right">Late</th><th className="px-4 py-3 text-right">Excused</th><th className="px-4 py-3 text-right">Marked</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.classGroupId + ":" + row.attendanceDate} className="hover:bg-slate-50"><td className="whitespace-nowrap px-4 py-3">{row.attendanceDate}</td><td className="px-4 py-3"><span className="font-medium text-slate-900">{row.className}</span><span className="ml-2 text-xs text-slate-500">{row.classCode}</span></td><td className="px-4 py-3 text-right tabular-nums">{row.presentCount}</td><td className="px-4 py-3 text-right tabular-nums">{row.absentCount}</td><td className="px-4 py-3 text-right tabular-nums">{row.lateCount}</td><td className="px-4 py-3 text-right tabular-nums">{row.excusedCount}</td><td className="px-4 py-3 text-right tabular-nums">{row.markedCount}</td></tr>)}</tbody></table></div>}
        </section>
      </>}
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums text-slate-950">{value.toLocaleString()}</p></div>;
}
