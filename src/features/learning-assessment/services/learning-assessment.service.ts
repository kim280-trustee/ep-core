import { learningAssessmentRepository } from "../repositories/learning-assessment.repository";
import type {
  LearningAssessmentInsert, LearningAttemptAnswerInput, LearningQuestionInsert,
} from "../types/learning-assessment.types";

export const learningAssessmentService = {
  listQuestions: (organizationId?: string) => learningAssessmentRepository.listQuestions(organizationId),
  listQuestionVersions: (questionId: string) => learningAssessmentRepository.listQuestionVersions(questionId),
  listQuestionObjectives: (questionVersionId: string) => learningAssessmentRepository.listQuestionObjectives(questionVersionId),
  listAssessments: (organizationId?: string) => learningAssessmentRepository.listAssessments(organizationId),
  listAssessmentQuestions: (assessmentId: string) => learningAssessmentRepository.listAssessmentQuestions(assessmentId),
  listAttempts: (studentUserId: string) => learningAssessmentRepository.listAttempts(studentUserId),
  listAttemptAnswers: (attemptId: string) => learningAssessmentRepository.listAttemptAnswers(attemptId),
  listResults: (studentUserId: string) => learningAssessmentRepository.listResults(studentUserId),
  createQuestion: (input: LearningQuestionInsert & { createdBy: string }) => learningAssessmentRepository.createQuestion(input),
  createAssessment: (input: LearningAssessmentInsert & { createdBy: string }) => learningAssessmentRepository.createAssessment(input),
  createAttempt: (input: {
    tenantId: string; organizationId: string | null; assessmentId: string; studentUserId: string;
    attemptNumber: number; previousAttemptId?: string | null;
  }) => learningAssessmentRepository.createAttempt(input),
  saveAnswer: (input: LearningAttemptAnswerInput) => learningAssessmentRepository.saveAnswer(input),
  submitAttempt: (attemptId: string) => learningAssessmentRepository.submitAttempt(attemptId),
};
