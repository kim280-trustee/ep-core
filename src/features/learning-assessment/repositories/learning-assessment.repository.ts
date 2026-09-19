import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningAssessment, LearningAssessmentQuestion, LearningAssessmentResult,
  LearningAttempt, LearningAttemptAnswer, LearningAttemptAnswerInput,
  LearningAssessmentInsert, LearningQuestion, LearningQuestionInsert,
  LearningQuestionObjective, LearningQuestionVersion,
} from "../types/learning-assessment.types";

type QuestionRow = Database["public"]["Tables"]["learning_questions"]["Row"];
type QuestionVersionRow = Database["public"]["Tables"]["learning_question_versions"]["Row"];
type QuestionObjectiveRow = Database["public"]["Tables"]["learning_question_objectives"]["Row"];
type AssessmentRow = Database["public"]["Tables"]["learning_assessments"]["Row"];
type AssessmentQuestionRow = Database["public"]["Tables"]["learning_assessment_questions"]["Row"];
type AttemptRow = Database["public"]["Tables"]["learning_attempts"]["Row"];
type AnswerRow = Database["public"]["Tables"]["learning_attempt_answers"]["Row"];
type ResultRow = Database["public"]["Tables"]["learning_assessment_results"]["Row"];

export interface LearningAssessmentRepository {
  listQuestions(organizationId?: string): Promise<LearningQuestion[]>;
  listQuestionVersions(questionId: string): Promise<LearningQuestionVersion[]>;
  listQuestionObjectives(questionVersionId: string): Promise<LearningQuestionObjective[]>;
  listAssessments(organizationId?: string): Promise<LearningAssessment[]>;
  listAssessmentQuestions(assessmentId: string): Promise<LearningAssessmentQuestion[]>;
  listAttempts(studentUserId: string): Promise<LearningAttempt[]>;
  listAttemptAnswers(attemptId: string): Promise<LearningAttemptAnswer[]>;
  listResults(studentUserId: string): Promise<LearningAssessmentResult[]>;
  createQuestion(input: LearningQuestionInsert & { createdBy: string }): Promise<LearningQuestion>;
  createAssessment(input: LearningAssessmentInsert & { createdBy: string }): Promise<LearningAssessment>;
  createAttempt(input: { tenantId: string; organizationId: string | null; assessmentId: string; studentUserId: string; attemptNumber: number; previousAttemptId?: string | null }): Promise<LearningAttempt>;
  saveAnswer(input: LearningAttemptAnswerInput): Promise<LearningAttemptAnswer>;
  submitAttempt(attemptId: string): Promise<LearningAttempt>;
}

const asRecord = (value: Json | null): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
};

const mapQuestion = (r: QuestionRow): LearningQuestion => ({
  id: r.id, organizationId: r.organization_id, code: r.code,
  questionType: r.question_type as LearningQuestion["questionType"], languageCode: r.language_code,
  status: r.status as LearningQuestion["status"], createdBy: r.created_by, updatedBy: r.updated_by,
  reviewedBy: r.reviewed_by, reviewedAt: r.reviewed_at, createdAt: r.created_at, updatedAt: r.updated_at,
});
const mapQuestionVersion = (r: QuestionVersionRow): LearningQuestionVersion => ({
  id: r.id, questionId: r.question_id, versionNo: r.version_no, prompt: asRecord(r.prompt),
  configuration: asRecord(r.configuration), explanation: r.explanation ? asRecord(r.explanation) : null,
  createdBy: r.created_by, reviewedBy: r.reviewed_by, reviewedAt: r.reviewed_at,
  publishedAt: r.published_at, createdAt: r.created_at, updatedAt: r.updated_at,
});
const mapQuestionObjective = (r: QuestionObjectiveRow): LearningQuestionObjective => ({
  questionVersionId: r.question_version_id, objectiveId: r.objective_id, weight: r.weight, createdAt: r.created_at,
});
const mapAssessment = (r: AssessmentRow): LearningAssessment => ({
  id: r.id, organizationId: r.organization_id, code: r.code, title: r.title, description: r.description,
  assessmentType: r.assessment_type as LearningAssessment["assessmentType"], languageCode: r.language_code,
  curriculumId: r.curriculum_id, gradeLevelId: r.grade_level_id,
  status: r.status as LearningAssessment["status"], createdBy: r.created_by, updatedBy: r.updated_by,
  reviewedBy: r.reviewed_by, reviewedAt: r.reviewed_at, publishedAt: r.published_at,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const mapAssessmentQuestion = (r: AssessmentQuestionRow): LearningAssessmentQuestion => ({
  id: r.id, assessmentId: r.assessment_id, questionVersionId: r.question_version_id,
  sequenceNo: r.sequence_no, points: r.points, required: r.required, createdAt: r.created_at,
});
const mapAttempt = (r: AttemptRow): LearningAttempt => ({
  id: r.id, tenantId: r.tenant_id, organizationId: r.organization_id, assessmentId: r.assessment_id,
  studentUserId: r.student_user_id, attemptNumber: r.attempt_number, previousAttemptId: r.previous_attempt_id,
  status: r.status as LearningAttempt["status"], startedAt: r.started_at, submittedAt: r.submitted_at,
  score: r.score, maxScore: r.max_score, percentage: r.percentage, createdAt: r.created_at, updatedAt: r.updated_at,
});
const mapAnswer = (r: AnswerRow): LearningAttemptAnswer => ({
  id: r.id, attemptId: r.attempt_id, assessmentQuestionId: r.assessment_question_id,
  answer: asRecord(r.answer), evaluationStatus: r.evaluation_status as LearningAttemptAnswer["evaluationStatus"],
  isCorrect: r.is_correct, awardedPoints: r.awarded_points, feedback: r.feedback ? asRecord(r.feedback) : null,
  evaluatedAt: r.evaluated_at, createdAt: r.created_at, updatedAt: r.updated_at,
});
const mapResult = (r: ResultRow): LearningAssessmentResult => ({
  id: r.id, attemptId: r.attempt_id, studentUserId: r.student_user_id, organizationId: r.organization_id,
  score: r.score, maxScore: r.max_score, percentage: r.percentage, passed: r.passed,
  evaluatedAt: r.evaluated_at, summary: asRecord(r.summary), createdAt: r.created_at, updatedAt: r.updated_at,
});

export const learningAssessmentRepository: LearningAssessmentRepository = {
  async listQuestions(organizationId) {
    let query = supabase.from("learning_questions").select("*").order("updated_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data, error } = await query; if (error) throw error; return (data ?? []).map(mapQuestion);
  },
  async listQuestionVersions(questionId) {
    const { data, error } = await supabase.from("learning_question_versions").select("*").eq("question_id", questionId).order("version_no", { ascending: false });
    if (error) throw error; return (data ?? []).map(mapQuestionVersion);
  },
  async listQuestionObjectives(questionVersionId) {
    const { data, error } = await supabase.from("learning_question_objectives").select("*").eq("question_version_id", questionVersionId);
    if (error) throw error; return (data ?? []).map(mapQuestionObjective);
  },
  async listAssessments(organizationId) {
    let query = supabase.from("learning_assessments").select("*").order("updated_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data, error } = await query; if (error) throw error; return (data ?? []).map(mapAssessment);
  },
  async listAssessmentQuestions(assessmentId) {
    const { data, error } = await supabase.from("learning_assessment_questions").select("*").eq("assessment_id", assessmentId).order("sequence_no");
    if (error) throw error; return (data ?? []).map(mapAssessmentQuestion);
  },
  async listAttempts(studentUserId) {
    const { data, error } = await supabase.from("learning_attempts").select("*").eq("student_user_id", studentUserId).order("created_at", { ascending: false });
    if (error) throw error; return (data ?? []).map(mapAttempt);
  },
  async listAttemptAnswers(attemptId) {
    const { data, error } = await supabase.from("learning_attempt_answers").select("*").eq("attempt_id", attemptId);
    if (error) throw error; return (data ?? []).map(mapAnswer);
  },
  async listResults(studentUserId) {
    const { data, error } = await supabase.from("learning_assessment_results").select("*").eq("student_user_id", studentUserId).order("evaluated_at", { ascending: false });
    if (error) throw error; return (data ?? []).map(mapResult);
  },
  async createQuestion(input) {
    const { data, error } = await supabase.from("learning_questions").insert({
      organization_id: input.organizationId, code: input.code, question_type: input.questionType,
      language_code: input.languageCode ?? "en", created_by: input.createdBy,
    }).select("*").single();
    if (error) throw error; return mapQuestion(data);
  },
  async createAssessment(input) {
    const { data, error } = await supabase.from("learning_assessments").insert({
      organization_id: input.organizationId, code: input.code, title: input.title,
      description: input.description ?? null, assessment_type: input.assessmentType,
      language_code: input.languageCode ?? "en", curriculum_id: input.curriculumId ?? null,
      grade_level_id: input.gradeLevelId ?? null, created_by: input.createdBy,
    }).select("*").single();
    if (error) throw error; return mapAssessment(data);
  },
  async createAttempt(input) {
    const { data, error } = await supabase.from("learning_attempts").insert({
      tenant_id: input.tenantId, organization_id: input.organizationId, assessment_id: input.assessmentId,
      student_user_id: input.studentUserId, attempt_number: input.attemptNumber,
      previous_attempt_id: input.previousAttemptId ?? null,
    }).select("*").single();
    if (error) throw error; return mapAttempt(data);
  },
  async saveAnswer(input) {
    const { data, error } = await supabase.from("learning_attempt_answers").upsert({
      attempt_id: input.attemptId, assessment_question_id: input.assessmentQuestionId,
      answer: input.answer as Json,
    }, { onConflict: "attempt_id,assessment_question_id" }).select("*").single();
    if (error) throw error; return mapAnswer(data);
  },
  async submitAttempt(attemptId) {
    const { data, error } = await supabase.from("learning_attempts").update({
      status: "submitted", submitted_at: new Date().toISOString(),
    }).eq("id", attemptId).select("*").single();
    if (error) throw error; return mapAttempt(data);
  },
};
