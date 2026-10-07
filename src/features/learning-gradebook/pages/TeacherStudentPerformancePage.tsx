import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningTeacherService } from "@/features/learning-teacher";
import { learningGradebookService } from "../services/learning-gradebook.service";

export default function TeacherStudentPerformancePage() {
  const { user } = useAuth();
  const { classGroupId = "", studentUserId = "" } = useParams();
  const classQuery = useQuery({
    queryKey: ["learning", "teacher-performance-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });
  const organizationId = classQuery.data?.classInfo.membership.organizationId ?? "";
  const subjects = classQuery.data?.classInfo.subjects ?? [];
  const student = classQuery.data?.students.find((item) => item.membership.userId === studentUserId);
  const termsQuery = useQuery({
    queryKey: ["learning", "performance-terms", organizationId],
    queryFn: () => learningGradebookService.listTerms(organizationId),
    enabled: Boolean(organizationId),
  });
  const [selectedTermId, setSelectedTermId] = useState("");
  const termId = selectedTermId || termsQuery.data?.[0]?.id || "";
  const categoriesQuery = useQuery({
    queryKey: ["learning", "performance-categories", organizationId],
    queryFn: () => learningGradebookService.listCategories(organizationId),
    enabled: Boolean(organizationId),
  });
  const categoryMap = useMemo(() => new Map((categoriesQuery.data ?? []).map((category) => [category.id, category.name])), [categoriesQuery.data]);
  const entryQueries = useQueries({
    queries: subjects.map((subject) => ({
      queryKey: ["learning", "student-performance-entries", termId, subject.id, studentUserId],
      queryFn: () => learningGradebookService.listEntries({ termId, classSubjectId: subject.id, studentUserId }),
      enabled: Boolean(termId && subject.id && studentUserId),
    })),
  });
  const gradeQueries = useQueries({
    queries: subjects.map((subject) => ({
      queryKey: ["learning", "student-performance-grades", termId, subject.id, studentUserId],
      queryFn: () => learningGradebookService.listTermGrades({ termId, classSubjectId: subject.id, studentUserId }),
      enabled: Boolean(termId && subject.id && studentUserId),
    })),
  });
  const entries = entryQueries.flatMap((query) => query.data ?? []);
  const grades = gradeQueries.flatMap((query) => query.data ?? []);
  const topicIds = useMemo(() => [...new Set(entries.filter((entry) => entry.includedInGrade && entry.topicId).map((entry) => entry.topicId as string))], [entries]);
  const topicsQuery = useQuery({
    queryKey: ["learning", "student-performance-topics", topicIds.join(",")],
    queryFn: () => learningGradebookService.listTopics(topicIds),
    enabled: topicIds.length > 0,
  });
  const topicMap = useMemo(() => new Map((topicsQuery.data ?? []).map((topic) => [topic.id, topic])), [topicsQuery.data]);
  const subjectMap = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject.subject.name])), [subjects]);
  const subjectRows = subjects.map((subject, index) => ({
    id: subject.id,
    name: subject.subject.name,
    grade: gradeQueries[index]?.data?.[0],
  }));
  const topicRows = useMemo(() => {
    const groups = new Map<string, { score: number; max: number; count: number }>();
    for (const entry of entries) {
      if (!entry.includedInGrade || !entry.topicId) continue;
      const current = groups.get(entry.topicId) ?? { score: 0, max: 0, count: 0 };
      current.score += entry.score;
      current.max += entry.maxScore;
      current.count += 1;
      groups.set(entry.topicId, current);
    }
    return [...groups.entries()].map(([id, value]) => ({ id, ...value, percentage: value.max > 0 ? value.score / value.max * 100 : 0 })).sort((a, b) => a.percentage - b.percentage);
  }, [entries]);
  const categoryRows = useMemo(() => {
    const groups = new Map<string, { name: string; score: number; max: number; count: number }>();
    for (const entry of entries) {
      if (!entry.includedInGrade) continue;
      const key = entry.categoryId ?? "uncategorized";
      const current = groups.get(key) ?? { name: entry.categoryId ? (categoryMap.get(entry.categoryId) ?? "Category") : "Other", score: 0, max: 0, count: 0 };
      current.score += entry.score;
      current.max += entry.maxScore;
      current.count += 1;
      groups.set(key, current);
    }
    return [...groups.values()].map((value) => ({ ...value, percentage: value.max > 0 ? value.score / value.max * 100 : 0 }));
  }, [entries, categoryMap]);

  if (!user) return <State text="Sign in to access student performance." />;
  if (classQuery.isPending || termsQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classQuery.isError || termsQuery.isError || !student) return <State text="The student performance record could not be loaded." />;

  const allLoading = entryQueries.some((query) => query.isPending) || gradeQueries.some((query) => query.isPending);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={"/teacher/classes/" + classGroupId + "/gradebook"} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to Gradebook</Link>
        <Link to="/teacher" className="text-sm font-medium text-slate-700 hover:text-slate-950">Teacher Dashboard</Link>
      </div>
      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">Student performance</p>
        <h1 className="mt-1 text-2xl font-bold">{student.name}</h1>
        <p className="mt-1 text-sm text-slate-300">{student.email}</p>
        <p className="mt-3 text-sm text-slate-300">{classQuery.data?.classInfo.classGroup.name}</p>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-medium text-slate-700">Term
          <select value={termId} onChange={(event) => setSelectedTermId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900">
            {(termsQuery.data ?? []).map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Subject performance</h2>
        <p className="mt-1 text-sm text-slate-500">Term grades across the subjects assigned to this class.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Percentage</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {subjectRows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-medium">{row.name}</td><td className="px-4 py-3">{row.grade ? row.grade.score.toFixed(2) + "%" : "Not calculated"}</td><td className="px-4 py-3">{row.grade?.letterGrade ?? "—"}</td><td className="px-4 py-3">{row.grade?.status ?? "—"}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Topic performance</h2>
        <p className="mt-1 text-sm text-slate-500">Only included grade records are counted; historical attempts remain preserved separately.</p>
        {allLoading ? <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" /> : topicRows.length ? (
          <div className="mt-4 space-y-3">{topicRows.map((row) => <div key={row.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate-900">{topicMap.get(row.id)?.name ?? "Topic"}</p><p className="text-xs text-slate-500">{row.count} included record{row.count === 1 ? "" : "s"}</p></div><p className="font-semibold">{row.percentage.toFixed(1)}%</p></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-900" style={{ width: Math.min(100, Math.max(0, row.percentage)) + "%" }} /></div></div>)}</div>
        ) : <p className="mt-4 text-sm text-slate-500">No topic-linked scores have been recorded for this term.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Category performance</h2>
        <p className="mt-1 text-sm text-slate-500">Included scores grouped by the configured gradebook categories.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Records</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Percentage</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {categoryRows.map((row) => <tr key={row.name}><td className="px-4 py-3 font-medium">{row.name}</td><td className="px-4 py-3">{row.count}</td><td className="px-4 py-3">{row.score}/{row.max}</td><td className="px-4 py-3">{row.percentage.toFixed(1)}%</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Assessment & category breakdown</h2>
        <p className="mt-1 text-sm text-slate-500">Included records only; excluded attempts are retained for audit history.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Assessment / record</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Percentage</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {entries.filter((entry) => entry.includedInGrade).map((entry) => <tr key={entry.id}><td className="px-4 py-3 font-medium">{entry.title}</td><td className="px-4 py-3">{entry.categoryId ? (categoryMap.get(entry.categoryId) ?? "Category") : "Other"}</td><td className="px-4 py-3">{entry.score}/{entry.maxScore}</td><td className="px-4 py-3">{entry.percentage.toFixed(1)}%</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Lock size={17} /><h2 className="font-semibold text-slate-900">Historical term grades</h2></div>
        <p className="mt-1 text-sm text-slate-500">Finalized grades are snapshots and are not silently overwritten by later calculations.</p>
        <div className="mt-4 space-y-2">{grades.length ? grades.map((grade) => <div key={grade.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"><div><p className="font-medium">{subjectMap.get(grade.classSubjectId) ?? "Subject"}</p><p className="text-xs text-slate-500">{grade.finalizedAt ? "Finalized " + new Date(grade.finalizedAt).toLocaleString() : "Draft"}</p></div><p className="font-semibold">{grade.score.toFixed(2)}% · {grade.status}</p></div>) : <p className="text-sm text-slate-500">No term-grade snapshots yet.</p>}</div>
      </section>
    </div>
  );
}

function State({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>; }
