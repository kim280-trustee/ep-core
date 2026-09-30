import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, RefreshCw, Save, Calculator, Lock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningGradebookService } from "../services/learning-gradebook.service";
import { learningTeacherService } from "@/features/learning-teacher";

export default function TeacherGradebookPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [categoryId, setCategoryId] = useState("");

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
    queryFn: () => learningGradebookService.listEntries({ termId: selectedTermId, classSubjectId: selectedSubjectId }),
    enabled: Boolean(selectedTermId && selectedSubjectId),
  });
  const categoriesQuery = useQuery({
    queryKey: ["learning", "gradebook-categories", organizationId],
    queryFn: () => learningGradebookService.listCategories(organizationId),
    enabled: Boolean(organizationId),
  });
  const termGradesQuery = useQuery({
    queryKey: ["learning", "teacher-term-grades", selectedTermId, selectedSubjectId],
    queryFn: () => learningGradebookService.listTermGrades({ termId: selectedTermId, classSubjectId: selectedSubjectId }),
    enabled: Boolean(selectedTermId && selectedSubjectId),
  });

  const students = classQuery.data?.students ?? [];
  const entries = entriesQuery.data ?? [];
  const termGrades = termGradesQuery.data ?? [];

  const assessmentColumns = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const entry of entries) {
      if (entry.recordType !== "assessment" || !entry.assessmentId) continue;
      if (!map.has(entry.assessmentId)) map.set(entry.assessmentId, { id: entry.assessmentId, title: entry.title });
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

  const gradeByStudent = useMemo(() => new Map(termGrades.map((grade) => [grade.studentUserId, grade])), [termGrades]);

  const refresh = () => {
    void entriesQuery.refetch();
    void termGradesQuery.refetch();
    void categoriesQuery.refetch();
  };

  const addScore = useMutation({
    mutationFn: () => {
      const parsedScore = Number(score);
      const parsedMax = Number(maxScore);
      if (!studentId) throw new Error("Select a student.");
      if (!title.trim()) throw new Error("Score title is required.");
      if (!Number.isFinite(parsedScore) || !Number.isFinite(parsedMax)) throw new Error("Enter valid score values.");
      return learningGradebookService.createManualEntry({
        termId: selectedTermId,
        classSubjectId: selectedSubjectId,
        studentUserId: studentId,
        title: title.trim(),
        score: parsedScore,
        maxScore: parsedMax,
        categoryId: categoryId || null,
      });
    },
    onSuccess: () => {
      setTitle("");
      setScore("");
      setStudentId("");
      void qc.invalidateQueries({ queryKey: ["learning", "teacher-gradebook-entries"] });
      void qc.invalidateQueries({ queryKey: ["learning", "teacher-term-grades"] });
    },
  });

  const calculateGrade = useMutation({
    mutationFn: (studentUserId: string) => learningGradebookService.calculateTermGrade({
      termId: selectedTermId,
      classSubjectId: selectedSubjectId,
      studentUserId,
    }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["learning", "teacher-term-grades"] }),
  });

  const finalizeGrade = useMutation({
    mutationFn: (studentUserId: string) => learningGradebookService.finalizeTermGrade({
      termId: selectedTermId,
      classSubjectId: selectedSubjectId,
      studentUserId,
    }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["learning", "teacher-term-grades"] }),
  });

  if (!user) return <EmptyState text="Sign in to access the Gradebook." />;
  if (classQuery.isPending || termsQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classQuery.isError || termsQuery.isError) return <ErrorState onRetry={refresh} />;

  const selectedSubject = subjects.find((item) => item.id === selectedSubjectId);
  const selectedTerm = termsQuery.data?.find((term) => term.id === selectedTermId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={"/teacher/classes/" + classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to class</Link>
        <Link to="/teacher" className="text-sm font-medium text-slate-700 hover:text-slate-950">Teacher Dashboard</Link>
      </div>

      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">Gradebook</p>
        <h1 className="mt-1 text-2xl font-bold">{classQuery.data?.classInfo.classGroup.name}</h1>
        <p className="mt-2 text-sm text-slate-300">Assessment results, manual scores, and term-grade snapshots.</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Subject
          <select value={selectedSubjectId} onChange={(e) => setSubjectId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900">
            {subjects.map((item) => <option key={item.id} value={item.id}>{item.subject.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Term
          <select value={selectedTermId} onChange={(e) => setTermId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900">
            {(termsQuery.data ?? []).map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><Save size={18} /><h2 className="font-semibold text-slate-900">Add manual score</h2></div>
        <p className="mt-1 text-sm text-slate-500">Manual scores are stored as separate auditable records and are included in term-grade calculation.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="">Student</option>{students.map((s) => <option key={s.membership.userId} value={s.membership.userId}>{s.name}</option>)}</select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="e.g. Midterm exam" />
          <input value={score} onChange={(e) => setScore(e.target.value)} type="number" min="0" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Score" />
          <input value={maxScore} onChange={(e) => setMaxScore(e.target.value)} type="number" min="1" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Max" />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="">No category</option>{(categoriesQuery.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <button type="button" disabled={addScore.isPending || !selectedTermId || !selectedSubjectId} onClick={() => addScore.mutate()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} />{addScore.isPending ? "Saving..." : "Save score"}</button>
        {addScore.isError && <p className="mt-3 text-sm text-red-700">{(addScore.error as Error).message}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div><h2 className="font-semibold text-slate-900">{selectedSubject?.subject.name ?? "Subject"} · {selectedTerm?.name ?? "Term"}</h2><p className="mt-1 text-xs text-slate-500">{entries.length} score records · {termGrades.length} term grades</p></div>
          {entriesQuery.isFetching && <RefreshCw size={17} className="animate-spin text-slate-400" />}
        </div>

        {entriesQuery.isError ? <div className="p-6 text-sm text-red-700">The Gradebook entries could not be loaded.</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                <th className="sticky left-0 bg-slate-50 px-5 py-3 font-semibold">Student</th>
                {assessmentColumns.map((column) => <th key={column.id} className="px-5 py-3 font-semibold">{column.title}</th>)}
                <th className="px-5 py-3 font-semibold">Manual / Other</th><th className="px-5 py-3 font-semibold">Term grade</th><th className="px-5 py-3 font-semibold">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const studentEntries = entryByStudent.get(student.membership.userId) ?? [];
                  const manual = studentEntries.filter((e) => e.recordType !== "assessment");
                  const grade = gradeByStudent.get(student.membership.userId);
                  return <tr key={student.membership.id} className="hover:bg-slate-50">
                    <td className="sticky left-0 bg-white px-5 py-4"><p className="font-medium text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td>
                    {assessmentColumns.map((column) => {
                      const entry = studentEntries.find((item) => item.assessmentId === column.id);
                      return <td key={column.id} className="whitespace-nowrap px-5 py-4 text-slate-700">{entry ? <><span className="font-semibold">{entry.score}/{entry.maxScore}</span><span className="ml-2 text-xs text-slate-500">{Math.round(entry.percentage)}%</span></> : <span className="text-slate-300">—</span>}</td>;
                    })}
                    <td className="px-5 py-4">{manual.length ? <div className="space-y-1">{manual.map((entry) => <div key={entry.id} className="text-xs text-slate-600">{entry.title}: <b>{entry.score}/{entry.maxScore}</b></div>)}</div> : <span className="text-slate-300">—</span>}</td>
                    <td className="whitespace-nowrap px-5 py-4">{grade ? <><span className="font-semibold">{grade.score.toFixed(2)}%</span><span className="ml-2 text-xs text-slate-500">{grade.status}</span></> : <span className="text-slate-300">Not calculated</span>}</td>
                    <td className="px-5 py-4"><div className="flex gap-2">{grade?.status === "finalized" ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Lock size={14} />Finalized</span> : <><button type="button" onClick={() => calculateGrade.mutate(student.membership.userId)} disabled={calculateGrade.isPending} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold"><Calculator size={14} />Calculate</button>{grade && <button type="button" onClick={() => finalizeGrade.mutate(student.membership.userId)} disabled={finalizeGrade.isPending} className="rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white">Finalize</button>}</>}</div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-400">Term grade formula: weighted average of included gradebook percentages. Letter-grade rules are intentionally not assumed until a grading scale is defined.</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><p className="font-semibold">The Gradebook could not be loaded.</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 text-sm">Try again</button></div>; }
