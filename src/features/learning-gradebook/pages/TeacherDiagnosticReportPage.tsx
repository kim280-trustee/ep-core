import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, ClipboardCheck, Target, TrendingUp, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "@/features/learning-assessment";
import { learningContentService } from "@/features/learning-content";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";

type QuestionObjectiveMap = {
  assessmentQuestionId: string;
  points: number;
  objectiveIds: string[];
};
type AttemptWithAnswers = Awaited<ReturnType<typeof learningAssessmentService.listAttemptsForAssessment>>[number] & {
  answers: Awaited<ReturnType<typeof learningAssessmentService.listAttemptAnswers>>;
};

function isAnswerCorrect(answer: AttemptWithAnswers["answers"][number], question: QuestionObjectiveMap) {
  if (answer.isCorrect !== null) return answer.isCorrect;
  if (answer.awardedPoints !== null) return answer.awardedPoints >= question.points;
  return null;
}

export default function TeacherDiagnosticReportPage() {
  const { user } = useAuth();
  const { classGroupId = "" } = useParams();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");

  const classQuery = useQuery({
    queryKey: ["learning", "teacher-class", user?.id, classGroupId],
    queryFn: () => learningTeacherService.getClassOverview(user!.id, classGroupId),
    enabled: Boolean(user?.id && classGroupId),
  });
  const organizationId = classQuery.data?.classInfo.membership.organizationId;

  const assessmentsQuery = useQuery({
    queryKey: ["learning", "diagnostic-report", "assessments", organizationId],
    queryFn: () => learningAssessmentService.listAssessments(organizationId),
    enabled: Boolean(organizationId),
  });
  const diagnosticAssessments = (assessmentsQuery.data ?? []).filter(
    (assessment) => assessment.assessmentType === "diagnostic" && assessment.status === "published",
  );
  const assessmentId = selectedAssessmentId || diagnosticAssessments[0]?.id || "";

  const classAssignmentsQuery = useQuery({
    queryKey: ["learning", "diagnostic-report", "class-assignments", classGroupId],
    queryFn: async () => {
      const assignments = await learningAssignmentsService.listAssignmentHistoryForClass(classGroupId);
      return Promise.all(assignments.filter((assignment) => assignment.status === "published").map(async (assignment) => ({
        assignment,
        items: await learningAssignmentsService.listItems(assignment.id),
      })));
    },
    enabled: Boolean(classGroupId && user?.id),
  });

  const questionsQuery = useQuery({
    queryKey: ["learning", "diagnostic-report", "questions", assessmentId],
    queryFn: async (): Promise<QuestionObjectiveMap[]> => {
      const items = await learningAssessmentService.listAssessmentQuestions(assessmentId);
      return Promise.all(items.map(async (item) => {
        const objectives = await learningAssessmentService.listQuestionObjectives(item.questionVersionId);
        return {
          assessmentQuestionId: item.id,
          points: item.points,
          objectiveIds: objectives.map((objective) => objective.objectiveId),
        };
      }));
    },
    enabled: Boolean(assessmentId),
  });
  const objectivesQuery = useQuery({
    queryKey: ["learning", "diagnostic-report", "objectives"],
    queryFn: () => learningContentService.listObjectives(),
    enabled: Boolean(assessmentId),
  });
  const attemptsQuery = useQuery({
    queryKey: ["learning", "diagnostic-report", "attempts", classGroupId, assessmentId],
    queryFn: async (): Promise<AttemptWithAnswers[]> => {
      const [attempts, assignments] = await Promise.all([
        learningAssessmentService.listAttemptsForAssessment(assessmentId),
        Promise.resolve(classAssignmentsQuery.data ?? []),
      ]);
      const classStudentIds = new Set((classQuery.data?.students ?? []).map((student) => student.membership.userId));
      const classAssignmentIds = new Set(
        assignments
          .filter(({ items }) => items.some((item) => item.itemType === "assessment" && item.assessmentId === assessmentId))
          .map(({ assignment }) => assignment.id),
      );
      const scoped = attempts.filter(
        (attempt) => attempt.status === "evaluated" &&
          typeof attempt.assignmentId === "string" &&
          classAssignmentIds.has(attempt.assignmentId) &&
          classStudentIds.has(attempt.studentUserId),
      );
      return Promise.all(scoped.map(async (attempt) => ({
        ...attempt,
        answers: await learningAssessmentService.listAttemptAnswers(attempt.id),
      })));
    },
    enabled: Boolean(assessmentId && classQuery.data?.students && classAssignmentsQuery.data),
  });

  const objectiveNames = new Map((objectivesQuery.data ?? []).map((objective) => [objective.id, objective.name || objective.code]));
  const questionMap = new Map((questionsQuery.data ?? []).map((question) => [question.assessmentQuestionId, question]));
  const latestAttempts = useMemo(() => {
    const latest = new Map<string, AttemptWithAnswers>();
    for (const attempt of attemptsQuery.data ?? []) {
      const current = latest.get(attempt.studentUserId);
      if (!current || attempt.attemptNumber > current.attemptNumber ||
        (attempt.attemptNumber === current.attemptNumber && attempt.createdAt > current.createdAt)) {
        latest.set(attempt.studentUserId, attempt);
      }
    }
    return latest;
  }, [attemptsQuery.data]);

  const objectiveSummaries = useMemo(() => {
    const counts = new Map<string, { attempted: number; correct: number }>();
    for (const attempt of latestAttempts.values()) {
      for (const answer of attempt.answers) {
        const question = questionMap.get(answer.assessmentQuestionId);
        if (!question) continue;
        const correct = isAnswerCorrect(answer, question);
        if (correct === null) continue;
        for (const objectiveId of question.objectiveIds) {
          const current = counts.get(objectiveId) ?? { attempted: 0, correct: 0 };
          current.attempted += 1;
          if (correct) current.correct += 1;
          counts.set(objectiveId, current);
        }
      }
    }
    return [...counts.entries()].map(([objectiveId, count]) => ({
      objectiveId,
      name: objectiveNames.get(objectiveId) ?? "Learning objective",
      ...count,
      percentage: count.attempted ? Math.round((count.correct / count.attempted) * 100) : 0,
    })).sort((a, b) => a.percentage - b.percentage || a.name.localeCompare(b.name));
  }, [latestAttempts, questionMap, objectiveNames]);

  const studentRows = useMemo(() => (classQuery.data?.students ?? []).map((student) => {
    const attempt = latestAttempts.get(student.membership.userId);
    const objectiveCounts = new Map<string, { attempted: number; correct: number }>();
    for (const answer of attempt?.answers ?? []) {
      const question = questionMap.get(answer.assessmentQuestionId);
      if (!question) continue;
      const correct = isAnswerCorrect(answer, question);
      if (correct === null) continue;
      for (const objectiveId of question.objectiveIds) {
        const current = objectiveCounts.get(objectiveId) ?? { attempted: 0, correct: 0 };
        current.attempted += 1;
        if (correct) current.correct += 1;
        objectiveCounts.set(objectiveId, current);
      }
    }
    const gaps = [...objectiveCounts.entries()]
      .map(([objectiveId, counts]) => ({
        objectiveId,
        name: objectiveNames.get(objectiveId) ?? "Learning objective",
        percentage: Math.round((counts.correct / counts.attempted) * 100),
      }))
      .filter((objective) => objective.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage);
    return { student, attempt, gaps };
  }), [classQuery.data?.students, latestAttempts, questionMap, objectiveNames]);

  if (!user) return <Panel title="Diagnostic report"><p>Sign in to continue.</p></Panel>;
  if (classQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classQuery.isError) return <Panel title="Diagnostic report"><p>This class could not be loaded. Confirm that you are assigned to it.</p></Panel>;

  const loading = assessmentsQuery.isPending || classAssignmentsQuery.isPending ||
    (Boolean(assessmentId) && (questionsQuery.isPending || objectivesQuery.isPending || attemptsQuery.isPending));
  const loadError = assessmentsQuery.error ?? classAssignmentsQuery.error ?? questionsQuery.error ?? objectivesQuery.error ?? attemptsQuery.error;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <Link to={`/teacher/classes/${classGroupId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />Back to class</Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="rounded-2xl bg-indigo-100 p-3 text-indigo-700"><ClipboardCheck size={24} /></span>
          <div><h1 className="text-2xl font-bold text-slate-900">Diagnostic results</h1><p className="mt-1 text-sm text-slate-600">{classQuery.data.classInfo.classGroup.name} · Compare student baseline performance by learning objective.</p></div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block max-w-2xl space-y-2">
          <span className="text-sm font-semibold text-slate-700">Published diagnostic assessment</span>
          <select value={assessmentId} onChange={(event) => setSelectedAssessmentId(event.target.value)} className="input">
            {diagnosticAssessments.map((assessment) => <option key={assessment.id} value={assessment.id}>{assessment.title} · {assessment.code}</option>)}
          </select>
        </label>
        <p className="mt-2 text-xs text-slate-500">Only evaluated attempts from this class's published assignments are included. Student attempts from other classes are excluded.</p>
      </section>

      {loading && <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}
      {loadError && <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><AlertCircle size={18} />Report data could not be loaded. Retry the page after confirming your class permissions.</div>}
      {!loading && !loadError && !diagnosticAssessments.length && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">No published diagnostic assessment yet</h2>
          <p className="mt-1 text-sm text-amber-900">Create a diagnostic assessment, publish it, then attach it to a published assignment for this class.</p>
          <Link to="/teacher/assessments" className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Open assessment builder</Link>
        </section>
      )}
      {!loading && !loadError && diagnosticAssessments.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon={<ClipboardCheck size={18} />} label="Students with evaluated attempts" value={latestAttempts.size} />
            <Stat icon={<Users size={18} />} label="Students in class" value={classQuery.data.students.length} />
            <Stat icon={<Target size={18} />} label="Objectives assessed" value={objectiveSummaries.length} />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2"><TrendingUp size={19} className="text-slate-500" /><h2 className="text-lg font-semibold text-slate-900">Class baseline by objective</h2></div>
            <p className="mt-1 text-sm text-slate-500">Sorted from lowest to highest accuracy to help identify where reteaching or targeted practice may be needed.</p>
            {objectiveSummaries.length ? <div className="mt-4 space-y-3">{objectiveSummaries.map((objective) => <div key={objective.objectiveId} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-slate-900">{objective.name}</p><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${objective.percentage < 60 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{objective.percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${objective.percentage < 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${objective.percentage}%` }} /></div><p className="mt-1 text-xs text-slate-500">{objective.correct} correct out of {objective.attempted} scored responses</p></div>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No scored objective responses are available yet. Check that published questions are mapped to learning objectives and students have submitted the diagnostic.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Student diagnostic status</h2>
            <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Latest result</th><th className="px-4 py-3">Attempt</th><th className="px-4 py-3">Priority objectives</th></tr></thead><tbody className="divide-y divide-slate-100">{studentRows.map(({ student, attempt, gaps }) => <tr key={student.membership.userId}><td className="px-4 py-3"><p className="font-medium text-slate-900">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td><td className="px-4 py-3">{attempt ? <span className="font-semibold">{attempt.percentage ?? 0}%</span> : <span className="text-slate-400">Not completed</span>}</td><td className="px-4 py-3">{attempt ? `#${attempt.attemptNumber}` : "—"}</td><td className="px-4 py-3">{gaps.length ? <div className="flex max-w-lg flex-wrap gap-1.5">{gaps.slice(0, 3).map((gap) => <span key={gap.objectiveId} className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">{gap.name} · {gap.percentage}%</span>)}</div> : <span className="text-slate-400">{attempt ? "No priority gap detected" : "Awaiting attempt"}</span>}</td></tr>)}</tbody></table></div>
          </section>
        </>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h1 className="text-xl font-bold text-slate-900">{title}</h1><div className="mt-3 text-sm text-slate-600">{children}</div></section>;
}
function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm text-slate-500">{icon}<span>{label}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}
