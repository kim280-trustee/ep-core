export type AcademicCatalogStatus = "active" | "inactive";
export type CurriculumStatus = "draft" | "active" | "retired";
export type AcademicPeriodStatus = "planned" | "active" | "closed";
export type ClassGroupStatus = "planned" | "active" | "archived";

export interface LearningCountry {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
  status: AcademicCatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningEducationSystem {
  id: string;
  countryId: string;
  code: string;
  name: string;
  description: string | null;
  status: AcademicCatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningCurriculum {
  id: string;
  educationSystemId: string;
  code: string;
  name: string;
  version: string | null;
  description: string | null;
  status: CurriculumStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningSubject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: AcademicCatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningCurriculumSubject {
  id: string;
  curriculumId: string;
  subjectId: string;
  code: string | null;
  name: string | null;
  status: AcademicCatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningGradeLevel {
  id: string;
  curriculumId: string;
  code: string;
  name: string;
  sequenceNo: number;
  description: string | null;
  status: AcademicCatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningAcademicYear {
  id: string;
  organizationId: string;
  curriculumId: string;
  name: string;
  code: string;
  startsOn: string;
  endsOn: string;
  status: AcademicPeriodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningTerm {
  id: string;
  organizationId: string;
  academicYearId: string;
  name: string;
  code: string;
  sequenceNo: number;
  startsOn: string;
  endsOn: string;
  status: AcademicPeriodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningClassGroup {
  id: string;
  organizationId: string;
  academicYearId: string;
  curriculumId: string;
  gradeLevelId: string;
  code: string;
  name: string;
  status: ClassGroupStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LearningClassSubject {
  id: string;
  organizationId: string;
  classGroupId: string;
  subjectId: string;
  status: ClassGroupStatus;
  createdAt: string;
  updatedAt: string;
}
