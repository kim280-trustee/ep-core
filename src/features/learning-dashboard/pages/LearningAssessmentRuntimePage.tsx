import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningActivityService } from "@/features/learning-activity";
import { learningAssessmentService } from "@/features/learning-assessment";
import { LearningNavigation } from "../components/LearningNavigation";

type QuestionDisplay = {
  id: string;
  assessmentQuestionId: string;
  questionType: string;
  prompt: string;
  options: Array<{ key: string; label: string }>;
  points: number;
  required: boolean;
};

function textFromJson(value: Record<string, unknown> | null | undefined) {
  if (!value) return "";
  const candidates = [value.text, value.question, value.content, value.en];
  const match = candidates.find((item) => typeof item === "string");
  return typeof match === "string" ? match : "";
}

function optionsFromConfiguration(value: Record<string, unknown>) {
  const raw = value.options;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((option, index) => {
    if (typeof option === "string") {
      return [{ key: String.fromCharCode(97 + index), label: option }];
    }

    if (option && typeof option === "object") {
      const record = option as Record<string, unknown>;
      const key = typeof record.key === "string"
        ? record.key
        : typeof record.value === "string"
          ? record.value
          : String.fromCharCode(97 + index);
      const label = typeof record.label === "string"
        ? record.label
        : typeof record.text === "string"
          ? record.text
          : key;

      return [{ key, label }];
    }

    return [];
  });
}

function answerPayload(value: string) {
  return { option_id: value };
}

export default function LearningAssessmentRuntimePage() {
  const { user } = useAuth();
  const { assignmentId, assessmentId } = useParams();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState<Awaited<
    ReturnType<typeof learningAssessmentService.submitAttempt>
  > | null>(null);
  const [started, setStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const id = assignmentId ?? "";
  const assessment = assessmentId ?? "";

  const assignmentQuery = useQuery({
    queryKey: ["learning", "assignment", id, user?.id],
    queryFn: () => learningAssignmentsService.getStudentAssignment(id, user!.id),
    enabled: Boolean(id && user?.id),
  });

  const assessmentQuery = useQuery({
    queryKey: ["learning", "assessment", assessment, user?.id],
    queryFn: async () => {
      const assessmentRows = await learningAssessmentService.listAssessments();
      const current = assessmentRows.find((item) => item.id === assessment);

      if (!current || current.status !== "published") {
        throw new Error("This assessment is not available.");
      }

      const assignment = await learningAssignmentsService.getStudentAssignment(id, user!.id);
      if (!assignment.items.some((item) => item.itemType === "assessment" && item.assessmentId === assessment)) {
        throw new Error("This assessment is not part of the selected assignment.");
      }

      const assessmentQuestions =
        await learningAssessmentService.listAssessmentQuestions(assessment);

      const questions = await Promise.all(
        assessmentQuestions.map(async (assessmentQuestion) => {
          const version =
            await learningAssessmentService.getQuestionVersion(
              assessmentQuestion.questionVersionId,
            );

          const questionRows = await learningAssessmentService.listQuestions(
            current.organizationId ?? undefined,
          );

          const question = questionRows.find(
            (item) => item.id === version.questionId,
          );

          if (!question) {
            throw new Error("A question could not be loaded.");
          }

          const prompt = textFromJson(version.prompt);

          return {
            id: version.id,
            assessmentQuestionId: assessmentQuestion.id,
            questionType: question.questionType,
            prompt: prompt || "Question",
            options: optionsFromConfiguration(version.configuration),
            points: assessmentQuestion.points,
            required: assessmentQuestion.required,
          } satisfies QuestionDisplay;
        }),
      );

      return { assessment: current, questions };
    },
    enabled: Boolean(assessment && user?.id),
  });

  const attemptsQuery = useQuery({
    queryKey: ["learning", "assessment-attempts", assessment, user?.id],
    queryFn: () => learningAssessmentService.listAttempts(user!.id),
    enabled: Boolean(assessment && user?.id),
  });

  const existingAttempts = useMemo(
    () =>
      (attemptsQuery.data ?? []).filter(
        (attempt) => attempt.assessmentId === assessment,
      ),
    [attemptsQuery.data, assessment],
  );

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("You must be signed in.");
      if (!assignmentQuery.data) {
        throw new Error("Assignment information is unavailable.");
      }
      if (!assessmentQuery.data) {
        throw new Error("Assessment information is unavailable.");
      }

      const maxAttempts = assignmentQuery.data.assignment.maxAttempts;

      if (maxAttempts !== null && existingAttempts.length >= maxAttempts) {
        throw new Error("You have reached the maximum number of attempts.");
      }

      const previousAttempt =
        existingAttempts.length > 0
          ? [...existingAttempts].sort(
              (a, b) => b.attemptNumber - a.attemptNumber,
            )[0]
          : null;

      const attempt = await learningAssessmentService.createAttempt({
        tenantId: user.tenantId,
        organizationId: assignmentQuery.data.assignment.organizationId,
        assessmentId: assessment,
        studentUserId: user.id,
        attemptNumber: (previousAttempt?.attemptNumber ?? 0) + 1,
        previousAttemptId: previousAttempt?.id ?? null,
      });

      let session: Awaited<ReturnType<typeof learningActivityService.startForStudent>> | null = null;
      try {
        session = await learningActivityService.startForStudent(
          user.id,
          "assessment",
          assessment,
        );
        await learningActivityService.logEvent({
          tenantId: session.tenantId,
          organizationId: session.organizationId,
          studentUserId: user.id,
          sessionId: session.id,
          activityType: "assessment_started",
          assessmentId: assessment,
          assignmentId: id,
        });
      } catch {
        // Activity telemetry must not strand an already-created assessment attempt.
      }
      return { attempt, session };
    },
    onSuccess: ({ attempt, session }) => {
      setAttemptId(attempt.id);
      setSessionId(session?.id ?? null);
      setStarted(true);
    },
  });

  const saveAnswerMutation = useMutation({
    mutationFn: async ({
      questionId,
      value,
    }: {
      questionId: string;
      value: string;
    }) => {
      if (!attemptId) throw new Error("Assessment attempt has not started.");

      return learningAssessmentService.saveAnswer({
        attemptId,
        assessmentQuestionId: questionId,
        answer: answerPayload(value),
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) throw new Error("Assessment attempt has not started.");

      const questions = assessmentQuery.data?.questions ?? [];

      for (const question of questions) {
        const value = answers[question.assessmentQuestionId];

        if (question.required && !value) {
          throw new Error(`Please answer question ${questions.indexOf(question) + 1}.`);
        }

        if (value) {
          await learningAssessmentService.saveAnswer({
            attemptId,
            assessmentQuestionId: question.assessmentQuestionId,
            answer: answerPayload(value),
          });
        }
      }

      return learningAssessmentService.submitAttempt(attemptId);
    },
    onSuccess: async (attempt) => {
      setSubmittedAttempt(attempt);

      if (sessionId && user?.id) {
        try {
          const session = await learningActivityService.listSessions(user.id);
          const activeSession = session.find((item) => item.id === sessionId);
          if (activeSession) {
            await learningActivityService.logEvent({
              tenantId: activeSession.tenantId,
              organizationId: activeSession.organizationId,
              studentUserId: user.id,
              sessionId,
              activityType: "assessment_submitted",
              assessmentId: assessment,
              assignmentId: id,
            });
          }
          await learningActivityService.endSession(sessionId);
        } catch {
          // Submission has succeeded; telemetry failures must not hide the result.
        }
      }
      const wasCompleted = assignmentQuery.data?.progress?.status === "completed";
      const progress = await learningAssignmentsService.refreshProgressForStudent(
        id,
        user!.id,
      );

      if (!wasCompleted && progress.status === "completed") {
        try {
          const assignmentSession = await learningActivityService.startForStudent(
            user!.id,
            "assignment",
            id,
          );
          await learningActivityService.logEvent({
            tenantId: assignmentSession.tenantId,
            organizationId: assignmentSession.organizationId,
            studentUserId: user!.id,
            sessionId: assignmentSession.id,
            activityType: "assignment_completed",
            assignmentId: id,
          });
        } catch {
          // Completion is persisted separately; its activity event is best-effort.
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["learning", "assessment-attempts", assessment, user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["learning", "student-overview", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["learning", "progress", user?.id],
      });
    },
  });

  useEffect(() => {
    if (!started || !attemptId) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!submittedAttempt) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [started, attemptId, submittedAttempt]);

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        Sign in to take this assessment.
      </div>
    );
  }

  if (assignmentQuery.isPending || assessmentQuery.isPending || attemptsQuery.isPending) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (assignmentQuery.isError || assessmentQuery.isError) {
    return (
      <div className="space-y-4">
        <Link
          to={`/learning/assignments/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to assignment
        </Link>

        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold">This assessment could not be loaded.</p>
            <p className="mt-1 text-sm">
              It may not be available to your account.
            </p>

            {assessmentQuery.error instanceof Error && (
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-red-100 p-3 text-xs">
                {assessmentQuery.error.message}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { assessment: currentAssessment, questions } = assessmentQuery.data;
  const maxAttempts = assignmentQuery.data.assignment.maxAttempts;
  const attemptsRemaining = maxAttempts === null ? null : Math.max(maxAttempts - existingAttempts.length, 0);
  const latestEvaluatedAttempt = [...existingAttempts]
    .filter((attempt) => attempt.status === "evaluated")
    .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];

  if (submittedAttempt) {
    return (
      <div className="space-y-6">
        <LearningNavigation />

        <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
          <CheckCircle2 size={28} />
          <h1 className="mt-3 text-2xl font-bold">Assessment submitted</h1>
          <p className="mt-2 text-sm text-slate-300">
            Your answers were submitted and evaluated.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Score</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {submittedAttempt.score ?? 0} / {submittedAttempt.maxScore ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Percentage</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {submittedAttempt.percentage ?? 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 text-2xl font-bold capitalize text-slate-900">
                {submittedAttempt.status.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/learning/assignments/${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft size={17} />
              Back to assignment
            </Link>

            <Link
              to="/learning/progress"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              View progress
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!started && attemptsRemaining === 0) {
    return (
      <div className="space-y-6">
        <LearningNavigation />

        <Link
          to={`/learning/assignments/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to assignment
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-medium text-slate-500">Assessment</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {currentAssessment.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You have used all available attempts for this assessment.
          </p>

          {latestEvaluatedAttempt && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Latest score</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {latestEvaluatedAttempt.score ?? 0} / {latestEvaluatedAttempt.maxScore ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Percentage</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {latestEvaluatedAttempt.percentage ?? 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Attempts used</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {existingAttempts.length}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/learning/assignments/${id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft size={17} />
              Back to assignment
            </Link>
            <Link
              to="/learning/progress"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              View progress
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-6">
        <LearningNavigation />

        <Link
          to={`/learning/assignments/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <ArrowLeft size={16} />
          Back to assignment
        </Link>

        <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
          <p className="text-sm text-slate-300">Assessment</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {currentAssessment.title}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {currentAssessment.description || "Complete the assessment and submit your answers."}
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} />
              {questions.length} {questions.length === 1 ? "question" : "questions"}
            </span>
            <span>{attemptsRemaining === null ? "Unlimited attempts" : `${attemptsRemaining} attempt(s) remaining`}</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <button
            type="button"
            disabled={startMutation.isPending || attemptsRemaining === 0}
            onClick={() => startMutation.mutate()}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {startMutation.isPending ? "Starting..." : attemptsRemaining === 0 ? "No attempts remaining" : "Start assessment"}
          </button>

          {startMutation.isError && (
            <p className="mt-3 text-sm text-red-600">
              {startMutation.error instanceof Error
                ? startMutation.error.message
                : "Could not start the assessment."}
            </p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LearningNavigation />

      <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm text-slate-300">Assessment attempt</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          {currentAssessment.title}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Answer all required questions before submitting.
        </p>
      </section>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <section
            key={question.assessmentQuestionId}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Question {index + 1}
                </p>
                <h2 className="mt-2 font-semibold text-slate-900">
                  {question.prompt}
                </h2>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-500">
                {question.points} pt
              </span>
            </div>

            {question.questionType === "single_choice" && (
              <div className="mt-5 space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name={question.assessmentQuestionId}
                      value={option.key}
                      checked={answers[question.assessmentQuestionId] === option.key}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAnswers((current) => ({
                          ...current,
                          [question.assessmentQuestionId]: value,
                        }));
                        void saveAnswerMutation.mutateAsync({
                          questionId: question.assessmentQuestionId,
                          value,
                        });
                      }}
                    />
                    <span className="text-sm text-slate-700">
                      {option.key}. {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {question.questionType !== "single_choice" && (
              <div className="mt-5">
                <input
                  type="text"
                  value={answers[question.assessmentQuestionId] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.assessmentQuestionId]: event.target.value,
                    }))
                  }
                  onBlur={(event) => {
                    if (event.target.value) {
                      void saveAnswerMutation.mutateAsync({
                        questionId: question.assessmentQuestionId,
                        value: event.target.value,
                      });
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  placeholder="Enter your answer"
                />
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button
          type="button"
          disabled={submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} />
          {submitMutation.isPending ? "Submitting..." : "Submit assessment"}
        </button>

        {submitMutation.isError && (
          <p className="mt-3 text-sm text-red-600">
            {submitMutation.error instanceof Error
              ? submitMutation.error.message
              : "Could not submit the assessment."}
          </p>
        )}
      </section>
    </div>
  );
}





