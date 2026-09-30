import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningGradebookService } from "../services/learning-gradebook.service";
import { learningTeacherService } from "@/features/learning-teacher";

export default function TeacherGradebookPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");

  const classQuery = useQuery({
    queryKey: ["learning", "teacher-gradebook-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  const organizationId = classQuery.data?.classInfo.membership.organizationId ?? "";
  const subjects = classQuery.data?.classInfo.subjects ?? [];

  const selectedSubjectId = subjectId || subjects[0]?.id || "";

  const termsQuery = useQuery({
    queryKey: ["learning", "gradebook-terms", organizationId],
    queryFn: () => learningGradebookService.listTerms(organizationId),
    enabled: Boolean(organizationId),
  });

  const selectedTermId = termId || termsQuery.data?.[0]?.id || "";

  const entriesQuery = useQuery({
    queryKey: ["learning", "teacher-gradebook-entries", selectedTermId, selectedSubjectId],
    queryFn: () =>
      learningGradebookService.listEntries({
        termId: selectedTermId,
        classSubjectId: selectedSubjectId,
      }),
    enabled: Boolean(selectedTermId && selectedSubjectId),
  });

  const students = classQuery.data?.students ?? [];
  const entries = entriesQuery.data ?? [];

  const assessmentColumns = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const entry of entries) {
      if (entry.recordType !== "assessment") continue;
      if (!map.has(entry.id)) map.set(entry.id, { id: entry.id, title: entry.title });
    }
    return [...map.values()];
  }, [entries]);

  const entryByStudent = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const entry of entries) {
      const current = map.get(entry.studentUserId) ?? [];
      current.push(entry);
      map.set(entry.studentUserId, current);
    }
    return map;
  }, [entries]);

  if (!user) return <EmptyState text="Sign in to access the Gradebook." />;
  if (classQuery.isPending || termsQuery.isPending) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }
  if (classQuery.isError || termsQuery.isError) {
    return <ErrorState onRetry={() => { void classQuery.refetch(); void termsQuery.refetch(); }} />;
  }

  const selectedSubject = subjects.find((item) => item.id === selectedSubjectId);
  const selectedTerm = termsQuery.data?.find((item) => item.id === selectedTermId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={"/teacher/classes/" + classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft size={16} />Back to class
        </Link>
        <Link to="/teacher" className="text-sm font-medium text-slate-700 hover:text-slate-950">Teacher Dashboard</Link>
      </div>

      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">Gradebook</p>
        <h1 className="mt-1 text-2xl font-bold">{classQuery.data?.classInfo.classGroup.name}</h1>
        <p className="mt-2 text-sm text-slate-300">Recorded assessment results for the selected subject and term.</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Subject
          <select
            value={selectedSubjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-slate-500"
          >
            {subjects.map((item) => <option key={item.id} value={item.id}>{item.subject.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Term
          <select
            value={selectedTermId}
            onChange={(event) => setTermId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-slate-500"
          >
            {(termsQuery.data ?? []).map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-slate-900">{selectedSubject?.subject.name ?? "Subject"} · {selectedTerm?.name ?? "Term"}</h2>
            <p className="mt-1 text-xs text-slate-500">{entries.length} recorded gradebook entries</p>
          </div>
          {entriesQuery.isFetching && <RefreshCw size={17} className="animate-spin text-slate-400" />}
        </div>

        {entriesQuery.isError ? (
          <div className="p-6 text-sm text-red-700">The Gradebook entries could not be loaded.</div>
        ) : assessmentColumns.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="sticky left-0 bg-slate-50 px-5 py-3 font-semibold">Student</th>
                  {assessmentColumns.map((column) => <th key={column.id} className="px-5 py-3 font-semibold">{column.title}</th>)}
                  <th className="px-5 py-3 font-semibold">Entries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const studentEntries = entryByStudent.get(student.membership.userId) ?? [];
                  return (
                    <tr key={student.membership.id} className="hover:bg-slate-50">
                      <td className="sticky left-0 bg-white px-5 py-4">
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </td>
                      {assessmentColumns.map((column) => {
                        const entry = studentEntries.find((item) => item.id === column.id);
                        return (
                          <td key={column.id} className="whitespace-nowrap px-5 py-4 text-slate-700">
                            {entry ? <><span className="font-semibold">{entry.score}/{entry.maxScore}</span><span className="ml-2 text-xs text-slate-500">{Math.round(entry.percentage)}%</span></> : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                      <td className="px-5 py-4 text-slate-500">{studentEntries.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <BookOpen className="mx-auto text-slate-300" size={28} />
            <p className="mt-3 font-medium text-slate-700">No assessment results recorded yet.</p>
            <p className="mt-1 text-sm text-slate-500">When students complete published assessments, their finalized results will appear here automatically.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
      <p className="font-semibold">The Gradebook could not be loaded.</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm">Try again</button>
    </div>
  );
}
