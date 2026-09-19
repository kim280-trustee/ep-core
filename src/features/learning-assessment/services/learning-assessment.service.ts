import { learningAssessmentRepository } from "../repositories/learning-assessment.repository";
import type { LearningAssessmentInsert,LearningAttemptAnswerInput,LearningQuestionInsert } from "../types/learning-assessment.types";
export const learningAssessmentService={
 listQuestions:(org?:string)=>learningAssessmentRepository.listQuestions(org),listQuestionVersions:(id:string)=>learningAssessmentRepository.listQuestionVersions(id),listQuestionObjectives:(id:string)=>learningAssessmentRepository.listQuestionObjectives(id),listAssessments:(org?:string)=>learningAssessmentRepository.listAssessments(org),listAssessmentQuestions:(id:string)=>learningAssessmentRepository.listAssessmentQuestions(id),listAttempts:(id:string)=>learningAssessmentRepository.listAttempts(id),listAttemptAnswers:(id:string)=>learningAssessmentRepository.listAttemptAnswers(id),listResults:(id:string)=>learningAssessmentRepository.listResults(id),
 createQuestion:(input:LearningQuestionInsert&{createdBy:string})=>learningAssessmentRepository.createQuestion(input),
 createQuestionVersion:(input:Parameters<typeof learningAssessmentRepository.createQuestionVersion>[0])=>learningAssessmentRepository.createQuestionVersion(input),
 addQuestionObjective:(input:Parameters<typeof learningAssessmentRepository.addQuestionObjective>[0])=>learningAssessmentRepository.addQuestionObjective(input),
 createAssessment:(input:LearningAssessmentInsert&{createdBy:string})=>learningAssessmentRepository.createAssessment(input),
 addAssessmentQuestion:(input:Parameters<typeof learningAssessmentRepository.addAssessmentQuestion>[0])=>learningAssessmentRepository.addAssessmentQuestion(input),
 publishQuestion:(id:string,reviewerId:string)=>learningAssessmentRepository.publishQuestion(id,reviewerId),publishAssessment:(id:string,reviewerId:string)=>learningAssessmentRepository.publishAssessment(id,reviewerId),
 updateQuestionStatus:(id:string,status:Parameters<typeof learningAssessmentRepository.updateQuestionStatus>[1],reviewerId?:string)=>learningAssessmentRepository.updateQuestionStatus(id,status,reviewerId),
 updateAssessmentStatus:(id:string,status:Parameters<typeof learningAssessmentRepository.updateAssessmentStatus>[1],reviewerId?:string)=>learningAssessmentRepository.updateAssessmentStatus(id,status,reviewerId),
 createAttempt:(input:Parameters<typeof learningAssessmentRepository.createAttempt>[0])=>learningAssessmentRepository.createAttempt(input),
 saveAnswer:(input:LearningAttemptAnswerInput)=>learningAssessmentRepository.saveAnswer(input),submitAttempt:(id:string)=>learningAssessmentRepository.submitAttempt(id)
};
