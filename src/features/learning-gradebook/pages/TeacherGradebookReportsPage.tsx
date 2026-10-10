import { useMemo, useState } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";
import { learningGradebookService } from "../services/learning-gradebook.service";
import { learningTeacherService } from "@/features/learning-teacher";

type ReportRow = {
  student: { membership: { id: string; userId: string }; name: string; email: string };
  grade: Awaited<ReturnType<typeof learningGradebookService.listTermGrades>>[number] | undefined;
};

function csvCell(value: string | number) {
  let text = String(value);
  // Prevent spreadsheet formula execution from untrusted names/emails or imported text.
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export default function TeacherGradebookReportsPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const [selectedTermId, setSelectedTermId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const classQ = useQuery({
    queryKey: ["learning", "gradebook-report-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  const organizationId = classQ.data?.classInfo.membership.organizationId ?? "";
  const subjects = classQ.data?.classInfo.subjects ?? [];

  const termsQ = useQuery({
    queryKey: ["learning", "gradebook-report-terms", organizationId],
    queryFn: () => learningGradebookService.listTerms(organizationId),
    enabled: Boolean(organizationId),
  });

  // Default to the most recent available term and the first class subject,
  // while allowing teachers to explicitly select either value.
  const term = termsQ.data?.find((item) => item.id === selectedTermId) ?? termsQ.data?.[0];
  const subject = subjects.find((item) => item.id === selectedSubjectId) ?? subjects[0];

  const gradesQ = useQuery({
    queryKey: ["learning", "gradebook-report-grades", classGroupId, term?.id, subject?.id],
    queryFn: () =>
      learningGradebookService.listTermGrades({
        termId: term!.id,
        classSubjectId: subject!.id,
      }),
    enabled: Boolean(term?.id && subject?.id),
  });

  const students = classQ.data?.students ?? [];
  const grades = gradesQ.data ?? [];

  const rows = useMemo<ReportRow[]>(
    () =>
      students
        .map((student) => ({
          student,
          grade: grades.find((grade) => grade.studentUserId === student.membership.userId),
        }))
        .sort((a, b) => {
          const aFinal = a.grade?.status === "finalized";
          const bFinal = b.grade?.status === "finalized";
          if (aFinal !== bFinal) return aFinal ? -1 : 1;
          return (b.grade?.score ?? -1) - (a.grade?.score ?? -1);
        }),
    [students, grades],
  );

  const visibleGrades = rows.flatMap((row) => (row.grade ? [row.grade] : []));
  const finalizedGrades = visibleGrades.filter((grade) => grade.status === "finalized");
  const rankByStudentId = useMemo(() => {
    const ranked = rows
      .filter((row) => row.grade?.status === "finalized")
      .sort((a, b) => (b.grade?.score ?? -1) - (a.grade?.score ?? -1));
    return new Map(ranked.map((row, index) => [row.student.membership.userId, index + 1]));
  }, [rows]);

  const distribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const label = row.grade?.letterGrade ?? "Ungraded";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [rows]);

  const finalizedAverage = finalizedGrades.length
    ? finalizedGrades.reduce((sum, grade) => sum + grade.score, 0) / finalizedGrades.length
    : null;

  function exportCsv() {
    const csvRows = [
      ["rank", "student", "email", "percentage", "grade", "status"],
      ...rows.map((row) => [
        row.grade?.status === "finalized"
          ? rankByStudentId.get(row.student.membership.userId) ?? ""
          : "",
        row.student.name,
        row.student.email,
        row.grade?.score.toFixed(2) ?? "",
        row.grade?.letterGrade ?? "",
        row.grade?.status ?? "ungraded",
      ]),
    ];
    const csv = "\uFEFF" + csvRows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `gradebook-${term?.code ?? "term"}-${subject?.subject.code ?? "subject"}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!user) {
    return <div className="p-6">Sign in required.</div>;
  }

  if (classQ.isPending || termsQ.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (classQ.isError || termsQ.isError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="font-semibold">The gradebook report could not be loaded.</h1>
        <p className="mt-1 text-sm">Refresh the page. If the problem continues, verify your class access and term configuration.</p>
      </section>
    );
  }

  if (!term || !subjects.length) {
    return (
      <section className="space-y-3 rounded-2xl border bg-white p-6">
        <Link to={`/teacher/classes/${classGroupId}/gradebook`} className="inline-flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft size={16} /> Back to Gradebook
        </Link>
        <h1 className="text-xl font-bold">Report setup is incomplete</h1>
        <p className="text-sm text-slate-600">
          {!term ? "Create or activate an academic term for this organization." : "Assign at least one subject to this class before generating a report."}
        </p>
      </section>
    );
  }

  if (gradesQ.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (gradesQ.isError) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="font-semibold">Grades could not be loaded.</h1>
        <p className="mt-1 text-sm">Check your access to this class, term and subject, then retry.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to={`/teacher/classes/${classGroupId}/gradebook`}
          className="inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <ArrowLeft size={16} /> Back to Gradebook
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="rounded-xl border px-3 py-2 text-sm font-semibold">
            <Printer size={15} className="mr-1 inline" /> Print
          </button>
          <button type="button" onClick={exportCsv} disabled={!students.length} className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50">
            <Download size={15} className="mr-1 inline" /> Export CSV
          </button>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 print:hidden">
        <label className="text-sm font-medium text-slate-700">
          Academic term
          <select
            value={term.id}
            onChange={(event) => setSelectedTermId(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
          >
            {(termsQ.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Subject
          <select
            value={subject.id}
            onChange={(event) => setSelectedSubjectId(event.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
          >
            {subjects.map((item) => (
              <option key={item.id} value={item.id}>{item.subject.name}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-2xl bg-slate-900 p-6 text-white print:bg-white print:p-0 print:text-black">
        <p className="text-sm text-slate-300 print:text-slate-500">Academic report</p>
        <h1 className="mt-1 text-2xl font-bold">{classQ.data?.classInfo.classGroup.name}</h1>
        <p className="mt-2 text-sm text-slate-300 print:text-slate-600">
          {subject.subject.name} · {term.name}
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Students" value={String(students.length)} />
        <Metric label="With grades" value={String(visibleGrades.length)} />
        <Metric label="Finalized average" value={finalizedAverage === null ? "—" : `${finalizedAverage.toFixed(2)}%`} />
        <Metric label="Finalized" value={String(finalizedGrades.length)} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Grade distribution</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          {distribution.map(([grade, count]) => (
            <div key={grade} className="rounded-xl bg-slate-50 p-3">
              <b>{grade}</b>
              <p className="text-sm text-slate-500">{count} student{count === 1 ? "" : "s"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Class result report</h2>
          <p className="mt-1 text-sm text-slate-500">
            Only finalized grades are ranked. Draft grades remain visible to authorized teachers but are not included in the finalized average or ranking.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Percentage</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.student.membership.id}>
                  <td className="px-5 py-3">
                    {row.grade?.status === "finalized" ? rankByStudentId.get(row.student.membership.userId) : "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold">{row.student.name}</td>
                  <td className="px-5 py-3 text-slate-500">{row.student.email}</td>
                  <td className="px-5 py-3">{row.grade ? `${row.grade.score.toFixed(2)}%` : "—"}</td>
                  <td className="px-5 py-3">{row.grade?.letterGrade ?? "—"}</td>
                  <td className="px-5 py-3">{row.grade?.status ?? "ungraded"}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No students are currently enrolled in this class.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-slate-400 print:hidden">
        This report is for the selected term and subject. Official school templates and academic-year aggregation must be validated against the pilot school's requirements.
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
