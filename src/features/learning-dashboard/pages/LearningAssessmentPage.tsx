import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, Circle, Send } from "lucide-react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "@/features/learning-assessment";
import { learningActivityService } from "@/features/learning-activity";

type Option = { id: string; text: string };
type QuestionView = {
  id: string;
  questionId: string;
  prompt: string;
  options: Option[];
  points: number;
  required: boolean;
  sequenceNo: number;
};

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionsValue(value: unknown): Option[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    return typeof record.id === "string" && typeof record.text === "string"
      ? [{ id: record.id, text: record.text }]
      : [];
  });
}

export default function LearningAssessmentPage() {
  const { user } = useAuth();
  const { assessmentId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignmentId") ?? "";
  const queryClient = useQueryClient();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const assessmentQuery = useQuery({
    queryKey: ["learning", "assessment", assessmentId],
    queryFn: () => learningAssessmentService.getAssessment(assessmentId),
    enabled: Boolean(assessmentId && user?.id),
  });

  const assignmentQuery = useQuery({
    queryKey: ["learning", "assignment", assignmentId, user?.id],
    queryFn: () => learningAssignmentsService.getStudentAssignment(assignmentId, user!.id),
    enabled: Boolean(assignmentId && user?.id),
  });

  const questionsQuery = useQuery({
    queryKey: ["learning", "assessment-questions", assessmentId],
    queryFn: async () => {
      const rows = await learningAssessmentService.listAssessmentQuestions(assessmentId);
      return Promise.all(rows.map(async (row) => {
        const version = await learningAssessmentService.getQuestionVersion(row.questionVersionId);
        const question = await learningAssessmentService.getQuestion(version.questionId);
        return {
          id: row.id,
          questionId: question.id,
          prompt: textValue(version.prompt.text),
          options: optionsValue(version.configuration.options),
          points: row.points,
          required: row.required,
          sequenceNo: row.sequenceNo,
        } satisfies QuestionView;
      }));
    },
    enabled: Boolean(assessmentId && user?.id),
  });

  const resultsQuery = useQuery({
    queryKey: ["learning", "assessment-results", user?.id],
    queryFn: () => learningAssessmentService.listResults(user!.id),
    enabled: Boolean(user?.id),
  });

  const currentResult = resultsQuery.data?.find((result) => result.attemptId === attemptId) ?? null;
  const questions = useMemo(
    () => [...(questionsQuery.data ?? [])].sort((a, b) => a.sequenceNo - b.sequenceNo),
    [questionsQuery.data],
  );

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be signed in.");
      const attempts = await learningAssessmentService.listAttempts(student.id);
      const active = attempts.find((attempt) => attempt.assessmentId === assessmentId && attempt.status === "in_progress");
      if (active) return active;
      const maxAttempts = assignmentQuery.data?.assignment.maxAttempts;
      const completedAttempts = attempts.filter((attempt) => attempt.assessmentId === assessmentId && attempt.status === "evaluated");
      if (maxAttempts !== null && maxAttempts !== undefined && completedAttempts.length >= maxAttempts) {
        throw new Error("You have reached the maximum number of attempts for this assignment.");
      }
      const previous = [...completedAttempts].sort((a, b) => b.attemptNumber - a.attemptNumber)[0] ?? null;
      return learningAssessmentService.createAttempt({
        tenantId: user.tenantId,
        organizationId: assessmentQuery.data?.organizationId ?? null,
        assessmentId,
        studentUserId: student.id,
        attemptNumber: previous ? previous.attemptNumber + 1 : 1,
        previousAttemptId: previous?.id ?? null,
      });
    },
    onSuccess: async (attempt) => {
      if (!user) throw new Error("You must be signed in.");
      const student = user;
      setAttemptId(attempt.id);
      setMessage(null);
      const session = await learningActivityService.startForStudent(student.id, "assessment", assessmentId);
      setSessionId(session.id);
      await learningActivityService.logEvent({
        tenantId: session.tenantId,
        organizationId: session.organizationId,
        studentUserId: student.id,
        sessionId: session.id,
        activityType: "assessment_started",
        assessmentId,
        assignmentId: assignmentId || null,
      });
      const existingAnswers = await learningAssessmentService.listAttemptAnswers(attempt.id);
      const restored: Record<string, string> = {};
      existingAnswers.forEach((answer) => {
        const optionId = answer.answer.option_id;
        if (typeof optionId === "string") restored[answer.assessmentQuestionId] = optionId;
      });
      setAnswers(restored);
    },
  });

  const answerMutation = useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: string; optionId: string }) => {
      if (!attemptId) throw new Error("Start the assessment first.");
      return learningAssessmentService.saveAnswer({
        attemptId,
        assessmentQuestionId: questionId,
        answer: { option_id: optionId },
      });
    },
    onSuccess: (_, variables) => {
      setAnswers((current) => ({ ...current, [variables.questionId]: variables.optionId }));
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) throw new Error("Start the assessment first.");
      return learningAssessmentService.submitAttempt(attemptId);
    },
    onSuccess: async (attempt) => {
      setMessage(attempt.status === "evaluated" ? "Assessment submitted and evaluated." : "Assessment submitted for evaluation.");

      if (!user) throw new Error("You must be signed in.");
      const student = user;

      if (sessionId) {
        await learningActivityService.logEvent({
          tenantId: student.tenantId,
          organizationId: assessmentQuery.data?.organizationId ?? null,
          studentUserId: student.id,
          sessionId,
          activityType: "assessment_submitted",
          assessmentId,
          assignmentId: assignmentId || null,
        });
        await learningActivityService.endSession(sessionId);
      }

      if (assignmentId && attempt.status === "evaluated") {
        const assignment = await learningAssignmentsService.getStudentAssignment(assignmentId, student.id);
        const requiredItems = assignment.items.filter((item) => item.required);
        const requiredAssessments = requiredItems.filter((item) => item.itemType === "assessment" && item.assessmentId);
        const hasUnsupportedRequiredItem = requiredItems.some((item) => item.itemType !== "assessment" || !item.assessmentId);

        if (!hasUnsupportedRequiredItem && requiredAssessments.length > 0) {
          const attempts = await learningAssessmentService.listAttempts(student.id);
          const evaluatedAssessmentIds = new Set(
            attempts.filter((item) => item.status === "evaluated").map((item) => item.assessmentId),
          );
          const allRequiredAssessmentsComplete = requiredAssessments.every(
            (item) => item.assessmentId && evaluatedAssessmentIds.has(item.assessmentId),
          );

          if (allRequiredAssessmentsComplete && assignment.progress && assignment.progress.status !== "completed") {
            await learningAssignmentsService.updateProgress(assignment.progress.id, "completed");
          }
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning", "assessment-results", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "student-overview", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["learning", "assignment", assignmentId, user?.id] }),
      ]);
    },
  });

  if (!user) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Sign in to take this assessment.</div>;
  if (assessmentQuery.isPending || questionsQuery.isPending) return <div className="space-y-4"><div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" /><div className="h-72 animate-pulse rounded-2xl bg-slate-200" /></div>;
  if (assessmentQuery.isError || questionsQuery.isError) return <div className="space-y-4"><Link to="/learning/assignments" className="inline-flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16} /> Back to assignments</Link><div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><AlertCircle size={20} /><p>Assessment questions could not be loaded.</p></div></div>;

  const assessment = assessmentQuery.data;
  const started = Boolean(attemptId);
  const evaluated = Boolean(currentResult) || (started && submitMutation.data?.status === "evaluated");

  return (
    <div className="space-y-6">
      <Link to={assignmentId ? `/learning/assignments/${assignmentId}` : "/learning/assignments"} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft size={16} /> Back</Link>
      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm text-slate-300">Assessment</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{assessment.title}</h1>
        <p className="mt-2 text-sm text-slate-300">{assessment.description || "Answer each question and submit when you are ready."}</p>
        <p className="mt-4 text-sm text-slate-300">{questions.length} {questions.length === 1 ? "question" : "questions"}</p>
      </section>

      {!started && !evaluated && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Ready to begin?</h2>
          <p className="mt-2 text-sm text-slate-600">Your answers are saved as you work. The server evaluates the published assessment when you submit it.</p>
          <button type="button" onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {startMutation.isPending ? "Starting..." : "Start assessment"}
          </button>
          {startMutation.isError && <p className="mt-3 text-sm text-red-600">{startMutation.error instanceof Error ? startMutation.error.message : "Could not start assessment."}</p>}
        </section>
      )}

      {started && !evaluated && (
        <section className="space-y-4">
          {questions.map((question, index) => (
            <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex gap-3">
                <span className="mt-0.5 text-sm font-bold text-slate-500">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">{question.prompt}</h2>
                  <div className="mt-4 space-y-2">
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option.id;
                      return (
                        <button key={option.id} type="button" onClick={() => answerMutation.mutate({ questionId: question.id, optionId: option.id })} disabled={answerMutation.isPending || submitMutation.isPending} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${selected ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                          {selected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          <span>{option.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
          <button type="button" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || answerMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            <Send size={17} /> {submitMutation.isPending ? "Submitting..." : "Submit assessment"}
          </button>
          {submitMutation.isError && <p className="text-sm text-red-600">{submitMutation.error instanceof Error ? submitMutation.error.message : "Could not submit assessment."}</p>}
        </section>
      )}

      {evaluated && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-emerald-700" size={22} />
            <div>
              <h2 className="text-lg font-semibold text-emerald-900">Assessment complete</h2>
              <p className="mt-1 text-sm text-emerald-800">
                Score: {currentResult?.percentage ?? submitMutation.data?.percentage ?? 0}%
              </p>
              {message && <p className="mt-1 text-sm text-emerald-800">{message}</p>}
              <Link to={assignmentId ? `/learning/assignments/${assignmentId}` : "/learning/progress"} className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">Continue</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
