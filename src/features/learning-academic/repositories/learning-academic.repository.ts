import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningAcademicYear,
  LearningClassGroup,
  LearningClassSubject,
  LearningCountry,
  LearningCurriculum,
  LearningCurriculumSubject,
  LearningEducationSystem,
  LearningGradeLevel,
  LearningSubject,
  LearningTerm,
} from "../types/learning-academic.types";

export interface LearningAcademicRepository {
  listCountries(): Promise<LearningCountry[]>;
  listEducationSystems(countryId?: string): Promise<LearningEducationSystem[]>;
  listCurricula(educationSystemId?: string): Promise<LearningCurriculum[]>;
  listSubjects(): Promise<LearningSubject[]>;
  listCurriculumSubjects(curriculumId: string): Promise<LearningCurriculumSubject[]>;
  listGradeLevels(curriculumId: string): Promise<LearningGradeLevel[]>;
  listAcademicYears(organizationId: string): Promise<LearningAcademicYear[]>;
  listTerms(organizationId: string, academicYearId: string): Promise<LearningTerm[]>;
  listClassGroups(organizationId: string, academicYearId?: string): Promise<LearningClassGroup[]>;
  listClassSubjects(organizationId: string, classGroupId: string): Promise<LearningClassSubject[]>;
}

const mapCountry = (r: CountryRow): LearningCountry => ({
  id: r.id, code: r.code, name: r.name, nativeName: r.native_name ?? null,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapSystem = (r: SystemRow): LearningEducationSystem => ({
  id: r.id, countryId: r.country_id, code: r.code, name: r.name,
  description: r.description ?? null, status: r.status,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapCurriculum = (r: CurriculumRow): LearningCurriculum => ({
  id: r.id, educationSystemId: r.education_system_id, code: r.code, name: r.name,
  version: r.version ?? null, description: r.description ?? null, status: r.status,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapSubject = (r: SubjectRow): LearningSubject => ({
  id: r.id, code: r.code, name: r.name, description: r.description ?? null,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapCurriculumSubject = (r: CurriculumSubjectRow): LearningCurriculumSubject => ({
  id: r.id, curriculumId: r.curriculum_id, subjectId: r.subject_id,
  code: r.code ?? null, name: r.name ?? null, status: r.status,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapGrade = (r: GradeRow): LearningGradeLevel => ({
  id: r.id, curriculumId: r.curriculum_id, code: r.code, name: r.name,
  sequenceNo: r.sequence_no, description: r.description ?? null, status: r.status,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapYear = (r: AcademicYearRow): LearningAcademicYear => ({
  id: r.id, organizationId: r.organization_id, curriculumId: r.curriculum_id,
  name: r.name, code: r.code, startsOn: r.starts_on, endsOn: r.ends_on,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapTerm = (r: TermRow): LearningTerm => ({
  id: r.id, organizationId: r.organization_id, academicYearId: r.academic_year_id,
  name: r.name, code: r.code, sequenceNo: r.sequence_no, startsOn: r.starts_on,
  endsOn: r.ends_on, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapClassGroup = (r: ClassGroupRow): LearningClassGroup => ({
  id: r.id, organizationId: r.organization_id, academicYearId: r.academic_year_id,
  curriculumId: r.curriculum_id, gradeLevelId: r.grade_level_id, code: r.code,
  name: r.name, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapClassSubject = (r: ClassSubjectRow): LearningClassSubject => ({
  id: r.id, organizationId: r.organization_id, classGroupId: r.class_group_id,
  subjectId: r.subject_id, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

export const learningAcademicRepository: LearningAcademicRepository = {
  async listCountries() {
    const { data, error } = await supabase.from("learning_countries").select("*").eq("status", "active").order("name");
    if (error) throw error;
    return (data ?? []).map(mapCountry);
  },
  async listEducationSystems(countryId) {
    let query = supabase.from("learning_education_systems").select("*").eq("status", "active").order("name");
    if (countryId) query = query.eq("country_id", countryId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapSystem);
  },
  async listCurricula(educationSystemId) {
    let query = supabase.from("learning_curricula").select("*").eq("status", "active").order("name");
    if (educationSystemId) query = query.eq("education_system_id", educationSystemId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapCurriculum);
  },
  async listSubjects() {
    const { data, error } = await supabase.from("learning_subjects").select("*").eq("status", "active").order("name");
    if (error) throw error;
    return (data ?? []).map(mapSubject);
  },
  async listCurriculumSubjects(curriculumId) {
    const { data, error } = await supabase.from("learning_curriculum_subjects").select("*").eq("curriculum_id", curriculumId).eq("status", "active").order("name");
    if (error) throw error;
    return (data ?? []).map(mapCurriculumSubject);
  },
  async listGradeLevels(curriculumId) {
    const { data, error } = await supabase.from("learning_grade_levels").select("*").eq("curriculum_id", curriculumId).eq("status", "active").order("sequence_no");
    if (error) throw error;
    return (data ?? []).map(mapGrade);
  },
  async listAcademicYears(organizationId) {
    const { data, error } = await supabase.from("learning_academic_years").select("*").eq("organization_id", organizationId).order("starts_on", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapYear);
  },
  async listTerms(organizationId, academicYearId) {
    const { data, error } = await supabase.from("learning_terms").select("*").eq("organization_id", organizationId).eq("academic_year_id", academicYearId).order("sequence_no");
    if (error) throw error;
    return (data ?? []).map(mapTerm);
  },
  async listClassGroups(organizationId, academicYearId) {
    let query = supabase.from("learning_class_groups").select("*").eq("organization_id", organizationId).order("name");
    if (academicYearId) query = query.eq("academic_year_id", academicYearId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapClassGroup);
  },
  async listClassSubjects(organizationId, classGroupId) {
    const { data, error } = await supabase.from("learning_class_subjects").select("*").eq("organization_id", organizationId).eq("class_group_id", classGroupId).order("created_at");
    if (error) throw error;
    return (data ?? []).map(mapClassSubject);
  },
};
