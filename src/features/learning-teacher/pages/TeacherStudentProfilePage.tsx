import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, Lock, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningMasteryService } from "@/features/learning-mastery";
import { learningGradebookService } from "@/features/learning-gradebook";
import { learningTeacherService } from "../services/learning-teacher.service";

export default function TeacherStudentProfilePage() {
  const { user } = useAuth();
  const { classGroupId = "", studentUserId = "" } = useParams();
  const [selectedTermId, setSelectedTermId] = useState("");

  const classQuery = useQuery({
    queryKey: ["learning", "teacher-student-profile-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });

  const student = classQuery.data?.students.find((item) => item.membership.userId === studentUserId);
  const organizationId = classQuery.data?.classInfo.membership.organizationId ?? "";
  const subjects = classQuery.data?.classInfo.subjects ?? [];

  const termsQuery = useQuery({
    queryKey: ["learning", "teacher-student-profile-terms", organizationId],
    queryFn: () => learningGradebookService.listTerms(organizationId),
    enabled: Boolean(organizationId),
  });
  const termId = selectedTermId || termsQuery.data?.[0]?.id || "";

  const gradeQueries = useQueries({
    queries: termsQuery.data?.flatMap((term) =>
      subjects.map((subject) => ({
        queryKey: ["learning", "student-profile-grade", term.id, subject.id, studentUserId],
        queryFn: () => learningGradebookService.listTermGrades({
          termId: term.id,
          classSubjectId: subject.id,
          studentUserId,
        }),
        enabled: Boolean(term.id && subject.id && studentUserId),
      })),
    ) ?? [],
  });

  const currentEntryQueries = useQueries({
    queries: subjects.map((subject) => ({
      queryKey: ["learning", "student-profile-entries", termId, subject.id, studentUserId],
      queryFn: () => learningGradebookService.listEntries({
        termId,
        classSubjectId: subject.id,
        studentUserId,
      }),
      enabled: Boolean(termId && subject.id && studentUserId),
    })),
  });

  const masteryQuery = useQuery({
    queryKey: ["learning", "teacher-student-profile-mastery", studentUserId],
    queryFn: () => learningMasteryService.listStudentMastery(studentUserId),
    enabled: Boolean(studentUserId),
  });

  const masteryObjectiveIds = (masteryQuery.data ?? []).map((item) => item.objectiveId);
  const objectivesQuery = useQuery({
    queryKey: ["learning", "teacher-student-profile-objectives", masteryObjectiveIds.join(",")],
    queryFn: () => learningMasteryService.listObjectives(masteryObjectiveIds),
    enabled: masteryQuery.isSuccess && masteryObjectiveIds.length > 0,
  });

  const assignments = (classQuery.data?.assignments ?? []).filter((item) => item.assignment.status === "published");
  const assignmentProgressQueries = useQueries({
    queries: assignments.map((item) => ({
      queryKey: ["learning", "student-profile-assignment-progress", item.assignment.id, studentUserId],
      queryFn: () => learningAssignmentsService.listProgressForAssignment(item.assignment.id),
      enabled: Boolean(studentUserId),
    })),
  });

  const studentAssignments = useMemo(() =>
    assignments.map((item, index) => ({
      ...item,
      progress: assignmentProgressQueries[index]?.data?.find((progress) => progress.studentUserId === studentUserId) ?? null,
    })), [assignments, assignmentProgressQueries, studentUserId]);

  const currentEntries = currentEntryQueries.flatMap((query) => query.data ?? []);
  const objectiveMap = useMemo(
    () => new Map((objectivesQuery.data ?? []).map((objective) => [objective.id, objective])),
    [objectivesQuery.data],
  );

  const historyRows = useMemo(() => {
    const terms = termsQuery.data ?? [];
    return terms.flatMap((term, termIndex) =>
      subjects.map((subject, subjectIndex) => {
        const index = termIndex * subjects.length + subjectIndex;
        return {
          key: term.id + ":" + subject.id,
          term: term.name,
          subject: subject.subject.name,
          grade: gradeQueries[index]?.data?.[0] ?? null,
        };
      }),
    ).filter((row) => row.grade);
  }, [termsQuery.data, subjects, gradeQueries]);

  if (!user) return <State text="Sign in to access student records." />;
  if (classQuery.isPending || termsQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classQuery.isError || termsQuery.isError || !student) return <State text="The student record could not be loaded." />;

  const mastery = [...(masteryQuery.data ?? [])].sort((a, b) => a.masteryScore - b.masteryScore);
  const incompleteAssignments = studentAssignments.filter((item) => item.progress?.status !== "completed").length;
  const currentGrades = subjects.map((subject, index) => ({
    subject: subject.subject.name,
    grade: gradeQueries[(termsQuery.data ?? []).findIndex((term) => term.id === termId) * subjects.length + index]?.data?.[0] ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={"/teacher/classes/" + classGroupId} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to class</Link>
        <Link to={"/teacher/classes/" + classGroupId + "/gradebook/" + studentUserId} className="text-sm font-medium text-slate-700 hover:text-slate-950">Detailed performance</Link>
      </div>

      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm text-slate-300">Student academic profile</p>
        <h1 className="mt-1 text-2xl font-bold">{student.name}</h1>
        <p className="mt-1 text-sm text-slate-300">{student.email}</p>
        <p className="mt-3 text-sm text-slate-300">{classQuery.data.classInfo.classGroup.name}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Target size={18} />} label="Mastery objectives" value={mastery.length} />
        <Stat icon={<Clock3 size={18} />} label="Incomplete assignments" value={incompleteAssignments} />
        <Stat icon={<CheckCircle2 size={18} />} label="Current scored subjects" value={currentGrades.filter((row) => row.grade).length} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="text-sm font-medium text-slate-700">Term
          <select value={termId} onChange={(event) => setSelectedTermId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900">
            {(termsQuery.data ?? []).map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Current term subjects</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {currentGrades.map((row) => (
            <div key={row.subject} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">{row.subject}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{row.grade ? row.grade.score.toFixed(2) + "%" : "Not calculated"}</p>
              <p className="mt-1 text-xs text-slate-500">{row.grade?.status ?? "No grade yet"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Assignment completion</h2>
        <div className="mt-4 space-y-3">
          {studentAssignments.length ? studentAssignments.map((item) => (
            <div key={item.assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
              <div><p className="font-medium text-slate-900">{item.assignment.title}</p><p className="text-xs text-slate-500">{item.assignment.status}</p></div>
              <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (item.progress?.status === "completed" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>{item.progress?.status ?? "not started"}</span>
            </div>
          )) : <p className="text-sm text-slate-500">No assignments are attached to this class.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Topic mastery</h2>
        <p className="mt-1 text-sm text-slate-500">Objectives are ordered from lowest to highest mastery so areas needing support are visible first.</p>
        <div className="mt-4 space-y-3">
          {mastery.length ? mastery.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="font-medium text-slate-900">{objectiveMap.get(item.objectiveId)?.name ?? "Learning objective"}</p><p className="text-xs text-slate-500">{item.state.replaceAll("_", " ")} · {item.attemptsCount} attempts</p></div>
                <p className="font-semibold">{item.masteryScore.toFixed(0)}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-900" style={{ width: Math.min(100, Math.max(0, item.masteryScore)) + "%" }} /></div>
            </div>
          )) : <p className="text-sm text-slate-500">No mastery records have been generated yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><Lock size={17} /><h2 className="font-semibold text-slate-900">Historical term grades</h2></div>
        <div className="mt-4 overflow-x-auto">
          {historyRows.length ? <table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Term</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{historyRows.map((row) => <tr key={row.key}><td className="px-4 py-3">{row.term}</td><td className="px-4 py-3 font-medium">{row.subject}</td><td className="px-4 py-3">{row.grade?.score.toFixed(2)}%</td><td className="px-4 py-3">{row.grade?.status}</td></tr>)}</tbody></table> : <p className="text-sm text-slate-500">No historical term grades have been recorded.</p>}
        </div>
      </section>

      {currentEntries.length > 0 && <p className="text-xs text-slate-400">Current term records: {currentEntries.length}. Gradebook inclusion rules and finalized snapshots remain authoritative.</p>}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-sm">{label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}
function State({ text }: { text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">{text}</div>; }
