import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningTeacherService } from "@/features/learning-teacher/services/learning-teacher.service";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningAssessmentService } from "../services/learning-assessment.service";

type GradeDraft = { score: string; feedback: string };

export default function TeacherAssessmentReviewPage() {
  const { user } = useAuth();
  const { assessmentId = "" } = useParams();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});

  const classesQuery = useQuery({
    queryKey: ["learning", "teacher-classes", user?.id],
    queryFn: () => learningTeacherService.listTeacherClasses(user!.id),
    enabled: Boolean(user?.id),
  });
  const assessmentQuery = useQuery({
    queryKey: ["learning", "assessment-review", "assessment", assessmentId],
    queryFn: () => learningAssessmentService.getAssessment(assessmentId),
    enabled: Boolean(assessmentId && user?.id),
  });
  const canReview = Boolean(
    assessmentQuery.data?.organizationId &&
    classesQuery.data?.some((item) => item.membership.organizationId === assessmentQuery.data?.organizationId),
  );

  const reviewQuery = useQuery({
    queryKey: ["learning", "assessment-review", assessmentId],
    enabled: Boolean(canReview && assessmentQuery.data?.status === "published"),
    queryFn: async () => {
      const [assessmentQuestions, attempts] = await Promise.all([
        learningAssessmentService.listAssessmentQuestions(assessmentId),
        learningAssessmentService.listAttemptsForAssessment(assessmentId),
      ]);
      const questionDetails = await Promise.all(assessmentQuestions.map(async (item) => {
        const version = await learningAssessmentService.getQuestionVersion(item.questionVersionId);
        const question = await learningAssessmentService.getQuestion(version.questionId);
        return { item, version, question };
      }));
      const attemptsWithAnswers = await Promise.all(attempts.map(async (attempt) => {
        const answers = await learningAssessmentService.listAttemptAnswers(attempt.id);
        const manualAnswers = answers.flatMap((answer) => {
          const detail = questionDetails.find((entry) => entry.item.id === answer.assessmentQuestionId);
          if (!detail || detail.question.questionType !== "short_answer") return [];
          return [{
            answer,
            points: detail.item.points,
            prompt: typeof detail.version.prompt.text === "string" ? detail.version.prompt.text : detail.question.code,
            response: typeof answer.answer.text_response === "string" ? answer.answer.text_response : "",
          }];
        });
        return { attempt, answers: manualAnswers };
      }));
      return attemptsWithAnswers
        .filter((row) =>
          row.attempt.status === "evaluating" ||
          (row.attempt.status === "evaluated" && row.answers.length > 0)
        )
        .sort((a, b) => b.attempt.createdAt.localeCompare(a.attempt.createdAt));
    },
  });

  const gradeMutation = useMutation({
    mutationFn: (input: { answerId: string; awardedPoints: number; teacherFeedback: string; assignmentId: string | null; studentUserId: string }) =>
      learningAssessmentService.gradeAttemptAnswer({
        answerId: input.answerId,
        awardedPoints: input.awardedPoints,
        teacherFeedback: input.teacherFeedback,
      }),
    onSuccess: async (result, variables) => {
      if (result.status === "evaluated" && variables.assignmentId) {
        try {
          await learningAssignmentsService.refreshProgressForStudent(variables.assignmentId, variables.studentUserId);
        } catch {
          // Marking is already persisted; assignment progress can be refreshed separately.
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["learning", "assessment-review", assessmentId] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "assessment-attempts"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "progress"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "assignment"] });
      await queryClient.invalidateQueries({ queryKey: ["learning", "gradebook"] });
    },
  });

  const pendingCount = useMemo(
    () => (reviewQuery.data ?? []).reduce((count, row) => count + row.answers.filter((item) => item.answer.evaluationStatus === "pending").length, 0),
    [reviewQuery.data],
  );

  if (!user) return <Panel>Sign in with an authorized teacher account to review assessment responses.</Panel>;
  if (classesQuery.isPending || assessmentQuery.isPending) return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  if (classesQuery.isError || assessmentQuery.isError || !assessmentQuery.data) {
    return <Panel>Assessment review information could not be loaded.</Panel>;
  }
  if (!canReview) return <Panel>This assessment is outside your active teacher organization access.</Panel>;
  if (assessmentQuery.data.status !== "published") return <Panel>Only published assessments can be reviewed.</Panel>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/teacher/assessments" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
        <ArrowLeft size={16} />Back to assessments
      </Link>

      <header className="rounded-2xl bg-slate-900 p-6 text-white">
        <div className="flex items-center gap-2 text-sm text-slate-300"><ClipboardCheck size={17} />Teacher marking</div>
        <h1 className="mt-1 text-2xl font-bold">{assessmentQuery.data.title}</h1>
        <p className="mt-2 text-sm text-slate-300">Review written responses and award marks using the published question's point value.</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          <span>{reviewQuery.data?.length ?? 0} attempts</span>
          <span>{pendingCount} responses awaiting review</span>
        </div>
      </header>

      {reviewQuery.isPending ? <div className="h-40 animate-pulse rounded-2xl bg-slate-100" /> : reviewQuery.isError ? (
        <Panel>Student responses could not be loaded. Refresh the page and try again.</Panel>
      ) : !reviewQuery.data?.length ? (
        <Panel>No student attempts have been submitted for this assessment yet.</Panel>
      ) : (
        <div className="space-y-4">
          {reviewQuery.data.map(({ attempt, answers }) => (
            <section key={attempt.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Student account · {attempt.studentUserId.slice(-8)}</h2>
                  <p className="mt-1 text-xs text-slate-500">Attempt {attempt.attemptNumber} · Submitted {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "—"}</p>
                </div>
                <span className={attempt.status === "evaluated" ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"}>
                  {attempt.status === "evaluated" ? "Marked" : "Awaiting review"}
                </span>
              </div>
              {!answers.length ? (
                <p className="mt-4 text-sm text-slate-500">No written answers in this attempt.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {answers.map(({ answer, points, prompt, response }) => {
                    const draft = drafts[answer.id] ?? {
                      score: answer.awardedPoints === null ? "" : String(answer.awardedPoints),
                      feedback: typeof answer.feedback?.teacher_feedback === "string" ? answer.feedback.teacher_feedback : "",
                    };
                    const score = Number(draft.score);
                    const validScore = draft.score.trim() !== "" && Number.isFinite(score) && score >= 0 && score <= points;
                    const pending = answer.evaluationStatus === "pending";
                    return (
                      <article key={answer.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-900">{prompt}</h3>
                          <span className="text-xs text-slate-500">Maximum {points} points</span>
                        </div>
                        <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-7 text-slate-800">{response || "No written response provided."}</div>
                        {pending ? (
                          <div className="mt-4 grid gap-3 md:grid-cols-[9rem_1fr_auto] md:items-end">
                            <label className="text-sm font-medium text-slate-700">Awarded points
                              <input type="number" min="0" max={points} step="0.01" value={draft.score} onChange={(event) => setDrafts((current) => ({ ...current, [answer.id]: { ...draft, score: event.target.value } }))} className="input mt-1 w-full" />
                            </label>
                            <label className="text-sm font-medium text-slate-700">Feedback
                              <textarea rows={2} value={draft.feedback} onChange={(event) => setDrafts((current) => ({ ...current, [answer.id]: { ...draft, feedback: event.target.value } }))} className="input mt-1 w-full resize-y" placeholder="Give constructive feedback (optional)" />
                            </label>
                            <button type="button" disabled={!validScore || gradeMutation.isPending} onClick={() => gradeMutation.mutate({ answerId: answer.id, awardedPoints: score, teacherFeedback: draft.feedback, assignmentId: attempt.assignmentId ?? null, studentUserId: attempt.studentUserId })} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                              {gradeMutation.isPending && gradeMutation.variables?.answerId === answer.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}Save mark
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                            Marked: {answer.awardedPoints ?? 0} / {points}
                            {typeof answer.feedback?.teacher_feedback === "string" && answer.feedback.teacher_feedback && <p className="mt-1">{answer.feedback.teacher_feedback}</p>}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              {attempt.status === "evaluated" && attempt.score !== null && (
                <p className="mt-4 text-sm font-semibold text-emerald-800">Final result: {attempt.score} / {attempt.maxScore} ({attempt.percentage ?? 0}%)</p>
              )}
            </section>
          ))}
        </div>
      )}
      {gradeMutation.isError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{gradeMutation.error instanceof Error ? gradeMutation.error.message : "Could not save the mark."}</p>}
      {gradeMutation.isSuccess && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Mark saved. Results and gradebook will update when all written answers are graded.</p>}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">{children}</div>;
}
