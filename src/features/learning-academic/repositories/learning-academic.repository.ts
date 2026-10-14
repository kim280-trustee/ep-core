import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  AcademicCatalogStatus, CurriculumStatus, AcademicPeriodStatus, ClassGroupStatus,
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

type CountryRow = Database["public"]["Tables"]["learning_countries"]["Row"];
type SystemRow = Database["public"]["Tables"]["learning_education_systems"]["Row"];
type CurriculumRow = Database["public"]["Tables"]["learning_curricula"]["Row"];
type SubjectRow = Database["public"]["Tables"]["learning_subjects"]["Row"];
type CurriculumSubjectRow = Database["public"]["Tables"]["learning_curriculum_subjects"]["Row"];
type GradeRow = Database["public"]["Tables"]["learning_grade_levels"]["Row"];
type AcademicYearRow = Database["public"]["Tables"]["learning_academic_years"]["Row"];
type TermRow = Database["public"]["Tables"]["learning_terms"]["Row"];
type ClassGroupRow = Database["public"]["Tables"]["learning_class_groups"]["Row"];
type ClassSubjectRow = Database["public"]["Tables"]["learning_class_subjects"]["Row"];

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
  createAcademicYear(input: import("../types/learning-academic.types").LearningAcademicYearInput): Promise<LearningAcademicYear>;
  updateAcademicYear(id: string, updates: import("../types/learning-academic.types").LearningAcademicYearUpdate): Promise<LearningAcademicYear>;
  createTerm(input: import("../types/learning-academic.types").LearningTermInput): Promise<LearningTerm>;
  updateTerm(id: string, updates: import("../types/learning-academic.types").LearningTermUpdate): Promise<LearningTerm>;
  createClassGroup(input: import("../types/learning-academic.types").LearningClassGroupInput): Promise<LearningClassGroup>;
  updateClassGroup(id: string, updates: import("../types/learning-academic.types").LearningClassGroupUpdate): Promise<LearningClassGroup>;
  activateClassSubject(organizationId: string, classGroupId: string, subjectId: string): Promise<LearningClassSubject>;
  updateClassSubjectStatus(id: string, status: ClassGroupStatus): Promise<LearningClassSubject>;
}

const mapCountry = (r: CountryRow): LearningCountry => ({
  id: r.id, code: r.code, name: r.name, nativeName: r.native_name ?? null,
  status: r.status as AcademicCatalogStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapSystem = (r: SystemRow): LearningEducationSystem => ({
  id: r.id, countryId: r.country_id, code: r.code, name: r.name,
  description: r.description ?? null, status: r.status as AcademicCatalogStatus,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapCurriculum = (r: CurriculumRow): LearningCurriculum => ({
  id: r.id, educationSystemId: r.education_system_id, code: r.code, name: r.name,
  version: r.version ?? null, description: r.description ?? null, status: r.status as CurriculumStatus,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapSubject = (r: SubjectRow): LearningSubject => ({
  id: r.id, code: r.code, name: r.name, description: r.description ?? null,
  status: r.status as AcademicCatalogStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapCurriculumSubject = (r: CurriculumSubjectRow): LearningCurriculumSubject => ({
  id: r.id, curriculumId: r.curriculum_id, subjectId: r.subject_id,
  code: r.code ?? null, name: r.name ?? null, status: r.status as AcademicCatalogStatus,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapGrade = (r: GradeRow): LearningGradeLevel => ({
  id: r.id, curriculumId: r.curriculum_id, code: r.code, name: r.name,
  sequenceNo: r.sequence_no, description: r.description ?? null, status: r.status as AcademicCatalogStatus,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapYear = (r: AcademicYearRow): LearningAcademicYear => ({
  id: r.id, organizationId: r.organization_id, curriculumId: r.curriculum_id,
  name: r.name, code: r.code, startsOn: r.starts_on, endsOn: r.ends_on,
  status: r.status as AcademicPeriodStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapTerm = (r: TermRow): LearningTerm => ({
  id: r.id, organizationId: r.organization_id, academicYearId: r.academic_year_id,
  name: r.name, code: r.code, sequenceNo: r.sequence_no, startsOn: r.starts_on,
  endsOn: r.ends_on, status: r.status as AcademicPeriodStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapClassGroup = (r: ClassGroupRow): LearningClassGroup => ({
  id: r.id, organizationId: r.organization_id, academicYearId: r.academic_year_id,
  curriculumId: r.curriculum_id, gradeLevelId: r.grade_level_id, code: r.code,
  name: r.name, status: r.status as ClassGroupStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapClassSubject = (r: ClassSubjectRow): LearningClassSubject => ({
  id: r.id, organizationId: r.organization_id, classGroupId: r.class_group_id,
  subjectId: r.subject_id, status: r.status as ClassGroupStatus, createdAt: r.created_at, updatedAt: r.updated_at,
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

  async createAcademicYear(input) {
    const { data, error } = await supabase.from("learning_academic_years").insert({
      organization_id: input.organizationId, curriculum_id: input.curriculumId, name: input.name.trim(),
      code: input.code.trim(), starts_on: input.startsOn, ends_on: input.endsOn, status: input.status,
    }).select("*").single();
    if (error) throw error;
    return mapYear(data);
  },
  async updateAcademicYear(id, updates) {
    const patch: Database["public"]["Tables"]["learning_academic_years"]["Update"] = { updated_at: new Date().toISOString() };
    if (updates.curriculumId !== undefined) patch.curriculum_id = updates.curriculumId;
    if (updates.name !== undefined) patch.name = updates.name.trim();
    if (updates.code !== undefined) patch.code = updates.code.trim();
    if (updates.startsOn !== undefined) patch.starts_on = updates.startsOn;
    if (updates.endsOn !== undefined) patch.ends_on = updates.endsOn;
    if (updates.status !== undefined) patch.status = updates.status;
    const { data, error } = await supabase.from("learning_academic_years").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return mapYear(data);
  },
  async createTerm(input) {
    const { data, error } = await supabase.from("learning_terms").insert({
      organization_id: input.organizationId, academic_year_id: input.academicYearId, name: input.name.trim(),
      code: input.code.trim(), sequence_no: input.sequenceNo, starts_on: input.startsOn, ends_on: input.endsOn, status: input.status,
    }).select("*").single();
    if (error) throw error;
    return mapTerm(data);
  },
  async updateTerm(id, updates) {
    const patch: Database["public"]["Tables"]["learning_terms"]["Update"] = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) patch.name = updates.name.trim();
    if (updates.code !== undefined) patch.code = updates.code.trim();
    if (updates.sequenceNo !== undefined) patch.sequence_no = updates.sequenceNo;
    if (updates.startsOn !== undefined) patch.starts_on = updates.startsOn;
    if (updates.endsOn !== undefined) patch.ends_on = updates.endsOn;
    if (updates.status !== undefined) patch.status = updates.status;
    const { data, error } = await supabase.from("learning_terms").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return mapTerm(data);
  },
  async createClassGroup(input) {
    const { data, error } = await supabase.from("learning_class_groups").insert({
      organization_id: input.organizationId, academic_year_id: input.academicYearId, curriculum_id: input.curriculumId,
      grade_level_id: input.gradeLevelId, code: input.code.trim(), name: input.name.trim(), status: input.status,
    }).select("*").single();
    if (error) throw error;
    return mapClassGroup(data);
  },
  async updateClassGroup(id, updates) {
    const patch: Database["public"]["Tables"]["learning_class_groups"]["Update"] = { updated_at: new Date().toISOString() };
    if (updates.curriculumId !== undefined) patch.curriculum_id = updates.curriculumId;
    if (updates.gradeLevelId !== undefined) patch.grade_level_id = updates.gradeLevelId;
    if (updates.code !== undefined) patch.code = updates.code.trim();
    if (updates.name !== undefined) patch.name = updates.name.trim();
    if (updates.status !== undefined) patch.status = updates.status;
    const { data, error } = await supabase.from("learning_class_groups").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return mapClassGroup(data);
  },
  async activateClassSubject(organizationId, classGroupId, subjectId) {
    const { data, error } = await supabase.from("learning_class_subjects").upsert({
      organization_id: organizationId, class_group_id: classGroupId, subject_id: subjectId, status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "class_group_id,subject_id" }).select("*").single();
    if (error) throw error;
    return mapClassSubject(data);
  },
  async updateClassSubjectStatus(id, status) {
    const { data, error } = await supabase.from("learning_class_subjects").update({
      status, updated_at: new Date().toISOString(),
    }).eq("id", id).select("*").single();
    if (error) throw error;
    return mapClassSubject(data);
  },

  async listClassSubjects(organizationId, classGroupId) {
    const { data, error } = await supabase.from("learning_class_subjects").select("*").eq("organization_id", organizationId).eq("class_group_id", classGroupId).order("created_at");
    if (error) throw error;
    return (data ?? []).map(mapClassSubject);
  },
};
