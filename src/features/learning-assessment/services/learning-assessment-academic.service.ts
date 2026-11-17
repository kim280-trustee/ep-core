import { learningAssessmentAcademicRepository } from "../repositories/learning-assessment-academic.repository";

export const learningAssessmentAcademicService = {
  listVersionScopeRows: (questionIds: string[]) =>
    learningAssessmentAcademicRepository.listVersionScopeRows(questionIds),
  listObjectiveScopeRows: (questionVersionIds: string[]) =>
    learningAssessmentAcademicRepository.listObjectiveScopeRows(questionVersionIds),
};
