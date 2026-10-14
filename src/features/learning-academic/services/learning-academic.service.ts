import { learningAcademicRepository } from "../repositories/learning-academic.repository";

export const learningAcademicService = {
  listCountries: () => learningAcademicRepository.listCountries(),
  listEducationSystems: (countryId?: string) => learningAcademicRepository.listEducationSystems(countryId),
  listCurricula: (educationSystemId?: string) => learningAcademicRepository.listCurricula(educationSystemId),
  listSubjects: () => learningAcademicRepository.listSubjects(),
  listCurriculumSubjects: (curriculumId: string) => learningAcademicRepository.listCurriculumSubjects(curriculumId),
  listGradeLevels: (curriculumId: string) => learningAcademicRepository.listGradeLevels(curriculumId),
  listAcademicYears: (organizationId: string) => learningAcademicRepository.listAcademicYears(organizationId),
  listTerms: (organizationId: string, academicYearId: string) => learningAcademicRepository.listTerms(organizationId, academicYearId),
  listClassGroups: (organizationId: string, academicYearId?: string) => learningAcademicRepository.listClassGroups(organizationId, academicYearId),
  listClassSubjects: (organizationId: string, classGroupId: string) => learningAcademicRepository.listClassSubjects(organizationId, classGroupId),
  createAcademicYear: learningAcademicRepository.createAcademicYear,
  updateAcademicYear: learningAcademicRepository.updateAcademicYear,
  createTerm: learningAcademicRepository.createTerm,
  updateTerm: learningAcademicRepository.updateTerm,
  createClassGroup: learningAcademicRepository.createClassGroup,
  updateClassGroup: learningAcademicRepository.updateClassGroup,
  activateClassSubject: learningAcademicRepository.activateClassSubject,
  updateClassSubjectStatus: learningAcademicRepository.updateClassSubjectStatus,
};
