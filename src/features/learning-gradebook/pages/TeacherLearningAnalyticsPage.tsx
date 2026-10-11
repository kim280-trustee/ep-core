import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, BarChart3, BookOpen, Target, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningGradebookService } from "../services/learning-gradebook.service";
import { learningTeacherService } from "@/features/learning-teacher";

export default function TeacherLearningAnalyticsPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const [termId, setTermId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const classQuery = useQuery({
    queryKey: ["learning", "teacher-analytics-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  const organizationId = classQuery.data?.classInfo.membership.organizationId ?? "";
  const subjects = classQuery.data?.classInfo.subjects ?? [];
  const selectedSubject = subjects.find((item) => item.id === subjectId) ?? subjects[0];

  const termsQuery = useQuery({
    queryKey: ["learning", "teacher-analytics-terms", organizationId],
    queryFn: () => learningGradebookService.listTerms(organizationId),
    enabled: Boolean(organizationId),
  });
  const selectedTerm = termsQuery.data?.find((item) => item.id === termId) ?? termsQuery.data?.[0];

  const entriesQuery = useQuery({
    queryKey: ["learning", "teacher-analytics-entries", selectedTerm?.id, selectedSubject?.id],
    queryFn: () => learningGradebookService.listEntries({
      termId: selectedTerm!.id,
      classSubjectId: selectedSubject!.id,
    }),
    enabled: Boolean(selectedTerm?.id && selectedSubject?.id),
  });
  const gradesQuery = useQuery({
    queryKey: ["learning", "teacher-analytics-grades", selectedTerm?.id, selectedSubject?.id],
    queryFn: () => learningGradebookService.listTermGrades({
      termId: selectedTerm!.id,
      classSubjectId: selectedSubject!.id,
    }),
    enabled: Boolean(selectedTerm?.id && selectedSubject?.id),
  });

  const entries = entriesQuery.data ?? [];
  const topicIds = useMemo(
    () => [...new Set(entries.map((entry) => entry.topicId).filter((id): id is string => Boolean(id)))],
    [entries],
  );
  const topicsQuery = useQuery({
    queryKey: ["learning", "teacher-analytics-topics", topicIds],
    queryFn: () => learningGradebookService.listTopics(topicIds),
    enabled: entriesQuery.isSuccess,
  });

  const students = classQuery.data?.students ?? [];
  const grades = gradesQuery.data ?? [];
  const includedEntries = useMemo(() => entries.filter((entry) => entry.includedInGrade && entry.status === "graded"), [entries]);
  const classAverage = includedEntries.length
    ? includedEntries.reduce((sum, entry) => sum + entry.percentage, 0) / includedEntries.length
    : null;
  const finalized = grades.filter((grade) => grade.status === "finalized");
  const finalizedAverage = finalized.length
    ? finalized.reduce((sum, grade) => sum + grade.score, 0) / finalized.length
    : null;
  const needsAttention = finalized.filter((grade) => grade.score < 50).length;
  const topicNameById = useMemo(() => new Map((topicsQuery.data ?? []).map((topic) => [topic.id, topic.name])), [topicsQuery.data]);
  const topicMetrics = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (const entry of includedEntries) {
      if (!entry.topicId) continue;
      const scores = grouped.get(entry.topicId) ?? [];
      scores.push(entry.percentage);
      grouped.set(entry.topicId, scores);
    }
    return [...grouped.entries()]
      .map(([topicId, scores]) => ({
        topicId,
        name: topicNameById.get(topicId) ?? "Topic",
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        records: scores.length,
      }))
      .sort((a, b) => a.average - b.average);
  }, [includedEntries, topicNameById]);

  if (!user) return <div className="rounded-2xl border bg-white p-6">Sign in to view class analytics.</div>;
  if (classQuery.isPending || termsQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classQuery.isError || termsQuery.isError) {
    return <ErrorState message="Class analytics could not be loaded. Check class access and academic term configuration." />;
  }
  if (!selectedTerm || !subjects.length) {
    return <section className="space-y-3 rounded-2xl border bg-white p-6">
      <Link to={`/teacher/classes/${classGroupId}/gradebook`} className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} /> Back to Gradebook</Link>
      <h1 className="text-xl font-bold">Analytics setup is incomplete</h1>
      <p className="text-sm text-slate-600">{!selectedTerm ? "Create or activate an academic term." : "Assign a subject to this class before viewing analytics."}</p>
    </section>;
  }
  if (entriesQuery.isPending || gradesQuery.isPending || topicsQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (entriesQuery.isError || gradesQuery.isError || topicsQuery.isError) {
    return <ErrorState message="Gradebook evidence could not be loaded. Retry after checking access to this class, term and subject." />;
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to={`/teacher/classes/${classGroupId}/gradebook`} className="inline-flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16} /> Back to Gradebook</Link>
      <Link to={`/teacher/classes/${classGroupId}/gradebook/reports`} className="text-sm font-semibold text-slate-700">Open grade reports</Link>
    </div>
    <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <p className="text-sm text-slate-300">Learning analytics</p>
      <h1 className="mt-1 text-2xl font-bold">{classQuery.data?.classInfo.classGroup.name}</h1>
      <p className="mt-2 text-sm text-slate-300">Evidence-based subject and topic performance for the selected term. Only recorded gradebook evidence is included.</p>
    </section>
    <section className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Academic term
        <select value={selectedTerm.id} onChange={(event) => setTermId(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
          {(termsQuery.data ?? []).map((term) => <option key={term.id} value={term.id}>{term.name} ({term.code})</option>)}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-700">Subject
        <select value={selectedSubject.id} onChange={(event) => setSubjectId(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.subject.name}</option>)}
        </select>
      </label>
    </section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Users size={18} />} label="Students in class" value={String(students.length)} detail="Current class roster" />
      <Metric icon={<BookOpen size={18} />} label="Recorded grade items" value={String(includedEntries.length)} detail="Graded and included in calculations" />
      <Metric icon={<BarChart3 size={18} />} label="Recorded-item average" value={classAverage === null ? "—" : classAverage.toFixed(1) + "%"} detail="Mean of included item percentages" />
      <Metric icon={<Target size={18} />} label="Finalized grades below 50%" value={String(needsAttention)} detail={finalized.length + " finalized grade(s)"} />
    </section>
    <section className="rounded-2xl border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900">Subject grade coverage</h2><p className="mt-1 text-sm text-slate-500">Finalized term grades are reported separately from individual assessment records.</p></div>
        <p className="text-sm font-semibold text-slate-700">{finalized.length}/{students.length} finalized</p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${students.length ? Math.min(100, finalized.length / students.length * 100) : 0}%` }} /></div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-slate-500"><span>{finalizedAverage === null ? "No finalized term grades yet" : "Finalized grade average: " + finalizedAverage.toFixed(1) + "%"}</span><span>{students.length - finalized.length} student(s) without a finalized grade</span></div>
    </section>
    <section className="rounded-2xl border bg-white p-5 sm:p-6">
      <div><h2 className="text-lg font-semibold text-slate-900">Topic performance</h2><p className="mt-1 text-sm text-slate-500">Topics are ranked from lowest to highest average using recorded, included grade items linked to each topic.</p></div>
      {topicMetrics.length ? <div className="mt-5 space-y-4">{topicMetrics.map((topic) => <div key={topic.topicId}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-medium text-slate-800">{topic.name}</span><span className="text-slate-500">{topic.average.toFixed(1)}% · {topic.records} record(s)</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(0, Math.min(100, topic.average))}%` }} /></div>
        {topic.average < 50 && <p className="mt-1 text-xs font-medium text-amber-700">Review may be needed based on the available recorded scores.</p>}
      </div>)}</div> : <div className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">No topic-linked grade items are available for this term and subject yet. Topic analytics will appear when gradebook records are linked to catalog topics.</div>}
    </section>
  </div>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm font-medium">{label}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

function ErrorState({ message }: { message: string }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} /><p className="text-sm">{message}</p></div>;
}
