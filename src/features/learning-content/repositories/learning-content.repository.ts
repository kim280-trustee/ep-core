import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningContentItem, LearningContentObjective, LearningContentVersion, LearningObjective,
  LearningObjectiveAlignment, LearningObjectivePrerequisite, LearningSkill, LearningTopic, LearningKnowledgeStatus,
  LearningContentStatus, LearningContentType, LearningSubject, LearningCurriculum, LearningGradeLevel,
} from "../types/learning-content.types";

type SubjectRow = Database["public"]["Tables"]["learning_subjects"]["Row"];
type CurriculumRow = Database["public"]["Tables"]["learning_curricula"]["Row"];
type GradeLevelRow = Database["public"]["Tables"]["learning_grade_levels"]["Row"];
type SkillRow = Database["public"]["Tables"]["learning_skills"]["Row"];
type TopicRow = Database["public"]["Tables"]["learning_topics"]["Row"];
type ObjectiveRow = Database["public"]["Tables"]["learning_objectives"]["Row"];
type PrerequisiteRow = Database["public"]["Tables"]["learning_objective_prerequisites"]["Row"];
type AlignmentRow = Database["public"]["Tables"]["learning_objective_alignments"]["Row"];
type ContentItemRow = Database["public"]["Tables"]["learning_content_items"]["Row"];
type ContentVersionRow = Database["public"]["Tables"]["learning_content_versions"]["Row"];
type ContentObjectiveRow = Database["public"]["Tables"]["learning_content_objectives"]["Row"];
type ContentResponseRow = Database["public"]["Tables"]["learning_content_responses"]["Row"];

const mapContentResponse = (r: ContentResponseRow): LearningContentResponse => ({
  id: r.id,
  organizationId: r.organization_id,
  assignmentId: r.assignment_id,
  contentItemId: r.content_item_id,
  contentVersionId: r.content_version_id,
  studentUserId: r.student_user_id,
  responseText: r.response_text,
  status: r.status as LearningContentResponse["status"],
  score: r.score === null ? null : Number(r.score),
  maxScore: r.max_score === null ? null : Number(r.max_score),
  teacherFeedback: r.teacher_feedback,
  submittedAt: r.submitted_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});


export interface LearningContentResponse {
  id: string;
  organizationId: string;
  assignmentId: string;
  contentItemId: string;
  contentVersionId: string | null;
  studentUserId: string;
  responseText: string;
  status: "draft" | "submitted";
  score: number | null;
  maxScore: number | null;
  teacherFeedback: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningContentRepository {
  listSubjects(curriculumId?: string): Promise<LearningSubject[]>;
  listCurricula(): Promise<LearningCurriculum[]>;
  listGradeLevels(curriculumId?: string): Promise<LearningGradeLevel[]>;
  listSkills(subjectId?: string): Promise<LearningSkill[]>;
  listTopics(skillId?: string): Promise<LearningTopic[]>;
  listObjectives(topicId?: string): Promise<LearningObjective[]>;
  listPrerequisites(objectiveId: string): Promise<LearningObjectivePrerequisite[]>;
  listAlignments(objectiveId?: string, curriculumId?: string, gradeLevelId?: string): Promise<LearningObjectiveAlignment[]>;
  listContent(organizationId?: string): Promise<LearningContentItem[]>;
  getContent(id: string, organizationId?: string): Promise<LearningContentItem>;
  deleteContent(id: string): Promise<void>;
  listContentVersions(contentItemId: string): Promise<LearningContentVersion[]>;
  listContentObjectives(contentItemId: string): Promise<LearningContentObjective[]>;
  createContent(input: { organizationId: string; code: string; title: string; contentType: LearningContentType; languageCode: string; createdBy: string }): Promise<LearningContentItem>;
  createVersion(input: { contentItemId: string; versionNo: number; body: Record<string, unknown>; changeSummary?: string | null; createdBy: string }): Promise<LearningContentVersion>;
  addObjective(input: { contentItemId: string; objectiveId: string; sequenceNo: number }): Promise<LearningContentObjective>;
  updateContentStatus(id: string, status: LearningContentStatus, reviewerId?: string): Promise<LearningContentItem>;
  updateVersionStatus(id: string, status: LearningContentStatus, reviewerId?: string): Promise<LearningContentVersion>;
  getStudentResponse(assignmentId: string, contentItemId: string, studentUserId: string): Promise<LearningContentResponse | null>;
  saveStudentResponse(input: { organizationId: string; assignmentId: string; contentItemId: string; contentVersionId: string | null; studentUserId: string; responseText: string; status: "draft" | "submitted" }): Promise<LearningContentResponse>;
  listTeacherResponses(assignmentId: string): Promise<(LearningContentResponse & { studentName: string; studentEmail: string | null })[]>;
  gradeTeacherResponse(input: { responseId: string; score: number; maxScore: number; teacherFeedback?: string | null }): Promise<string>;
}

const mapSubject = (r: SubjectRow): LearningSubject => ({ id:r.id, code:r.code, name:r.name, description:r.description, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapCurriculum = (r: CurriculumRow): LearningCurriculum => ({ id:r.id, code:r.code, name:r.name, version:r.version, description:r.description, status:r.status, createdAt:r.created_at, updatedAt:r.updated_at });
const mapGradeLevel = (r: GradeLevelRow): LearningGradeLevel => ({ id:r.id, curriculumId:r.curriculum_id, code:r.code, name:r.name, sequenceNo:r.sequence_no, description:r.description, status:r.status, createdAt:r.created_at, updatedAt:r.updated_at });
const mapSkill = (r: SkillRow): LearningSkill => ({ id:r.id, subjectId:r.subject_id, code:r.code, name:r.name, description:r.description, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapTopic = (r: TopicRow): LearningTopic => ({ id:r.id, skillId:r.skill_id, code:r.code, name:r.name, description:r.description, sequenceNo:r.sequence_no, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapObjective = (r: ObjectiveRow): LearningObjective => ({ id:r.id, topicId:r.topic_id, code:r.code, name:r.name, description:r.description, sequenceNo:r.sequence_no, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapPrerequisite = (r: PrerequisiteRow): LearningObjectivePrerequisite => ({ objectiveId:r.objective_id, prerequisiteObjectiveId:r.prerequisite_objective_id, createdAt:r.created_at });
const mapAlignment = (r: AlignmentRow): LearningObjectiveAlignment => ({ id:r.id, objectiveId:r.objective_id, curriculumId:r.curriculum_id, gradeLevelId:r.grade_level_id, sequenceNo:r.sequence_no, required:r.required, notes:r.notes, createdAt:r.created_at, updatedAt:r.updated_at });
const mapContentItem = (r: ContentItemRow): LearningContentItem => ({ id:r.id, organizationId:r.organization_id, code:r.code, title:r.title, contentType:r.content_type as LearningContentItem["contentType"], languageCode:r.language_code, status:r.status as LearningContentItem["status"], createdBy:r.created_by, updatedBy:r.updated_by, reviewedBy:r.reviewed_by, reviewedAt:r.reviewed_at, metadata:(r.metadata ?? {}) as Record<string,unknown>, createdAt:r.created_at, updatedAt:r.updated_at });
const mapContentVersion = (r: ContentVersionRow): LearningContentVersion => ({ id:r.id, contentItemId:r.content_item_id, versionNo:r.version_no, body:(r.body ?? {}) as Record<string,unknown>, changeSummary:r.change_summary, status:r.status as LearningContentVersion["status"], createdBy:r.created_by, reviewedBy:r.reviewed_by, reviewedAt:r.reviewed_at, publishedAt:r.published_at, createdAt:r.created_at, updatedAt:r.updated_at });
const mapContentObjective = (r: ContentObjectiveRow): LearningContentObjective => ({ contentItemId:r.content_item_id, objectiveId:r.objective_id, sequenceNo:r.sequence_no, createdAt:r.created_at });

export const learningContentRepository: LearningContentRepository = {
  async listSubjects(curriculumId) {
    if (!curriculumId) {
      const {data,error}=await supabase.from("learning_subjects").select("*").eq("status","active").order("name");
      if(error)throw error;
      return(data??[]).map(mapSubject);
    }
    const {data:curriculumSubjects,error:curriculumSubjectError}=await supabase.from("learning_curriculum_subjects").select("subject_id").eq("curriculum_id",curriculumId).eq("status","active");
    if(curriculumSubjectError)throw curriculumSubjectError;
    const subjectIds=(curriculumSubjects??[]).map((item)=>item.subject_id);
    if(!subjectIds.length)return[];
    const {data:subjects,error:subjectError}=await supabase.from("learning_subjects").select("*").eq("status","active").in("id",subjectIds).order("name");
    if(subjectError)throw subjectError;
    return(subjects??[]).map(mapSubject);
  },
  async listCurricula(){const{data,error}=await supabase.from("learning_curricula").select("*").eq("status","active").order("name");if(error)throw error;return(data??[]).map(mapCurriculum);},
  async listGradeLevels(curriculumId){let q=supabase.from("learning_grade_levels").select("*").eq("status","active").order("sequence_no");if(curriculumId)q=q.eq("curriculum_id",curriculumId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapGradeLevel);},
  async listSkills(subjectId){let q=supabase.from("learning_skills").select("*").eq("status","active").order("name");if(subjectId)q=q.eq("subject_id",subjectId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapSkill);},
  async listTopics(skillId){let q=supabase.from("learning_topics").select("*").eq("status","active").order("sequence_no");if(skillId)q=q.eq("skill_id",skillId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapTopic);},
  async listObjectives(topicId){let q=supabase.from("learning_objectives").select("*").eq("status","active").order("sequence_no");if(topicId)q=q.eq("topic_id",topicId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapObjective);},
  async listPrerequisites(objectiveId){const{data,error}=await supabase.from("learning_objective_prerequisites").select("*").eq("objective_id",objectiveId);if(error)throw error;return(data??[]).map(mapPrerequisite);},
  async listAlignments(objectiveId,curriculumId,gradeLevelId){let q=supabase.from("learning_objective_alignments").select("*").order("sequence_no");if(objectiveId)q=q.eq("objective_id",objectiveId);if(curriculumId)q=q.eq("curriculum_id",curriculumId);if(gradeLevelId)q=q.eq("grade_level_id",gradeLevelId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapAlignment);},
  async listContent(organizationId){let q=supabase.from("learning_content_items").select("*").order("updated_at",{ascending:false});if(organizationId)q=q.eq("organization_id",organizationId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapContentItem);},
  async getContent(id,organizationId){let q=supabase.from("learning_content_items").select("*").eq("id",id);if(organizationId)q=q.eq("organization_id",organizationId);const{data,error}=await q.maybeSingle();if(error)throw error;if(!data)throw new Error("Content item not found.");return mapContentItem(data);},
  async deleteContent(id){const{error}=await supabase.from("learning_content_items").delete().eq("id",id);if(error)throw error;},
  async listContentVersions(contentItemId){const{data,error}=await supabase.from("learning_content_versions").select("*").eq("content_item_id",contentItemId).order("version_no",{ascending:false});if(error)throw error;return(data??[]).map(mapContentVersion);},
  async listContentObjectives(contentItemId){const{data,error}=await supabase.from("learning_content_objectives").select("*").eq("content_item_id",contentItemId).order("sequence_no");if(error)throw error;return(data??[]).map(mapContentObjective);},
  async createContent(input){const{data,error}=await supabase.from("learning_content_items").insert({organization_id:input.organizationId,code:input.code,title:input.title,content_type:input.contentType,language_code:input.languageCode,created_by:input.createdBy}).select("*").single();if(error)throw error;return mapContentItem(data);},
  async createVersion(input){const{data,error}=await supabase.from("learning_content_versions").insert({content_item_id:input.contentItemId,version_no:input.versionNo,body:input.body as Json,change_summary:input.changeSummary??null,created_by:input.createdBy}).select("*").single();if(error)throw error;return mapContentVersion(data);},
  async addObjective(input){const{data,error}=await supabase.from("learning_content_objectives").insert({content_item_id:input.contentItemId,objective_id:input.objectiveId,sequence_no:input.sequenceNo}).select("*").single();if(error)throw error;return mapContentObjective(data);},
  async updateContentStatus(id,status,_reviewerId){
    // The database RPC derives the reviewer from auth.uid(); caller-supplied identity is not trusted.
    void _reviewerId;
    const rpcClient=supabase as unknown as {
      rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:ContentItemRow|null;error:{message:string}|null}>
    };
    const{data,error}=await rpcClient.rpc("transition_learning_content_status",{
      p_content_item_id:id,
      p_status:status,
    });
    if(error)throw new Error(error.message);
    if(!data)throw new Error("Content status transition returned no content record.");
    return mapContentItem(data);
  },
  async getStudentResponse(assignmentId,contentItemId,studentUserId){
    const {data,error}=await supabase.from("learning_content_responses").select("*").eq("assignment_id",assignmentId).eq("content_item_id",contentItemId).eq("student_user_id",studentUserId).maybeSingle();
    if(error)throw error;
    if(!data)return null;
    return mapContentResponse(data);
  },
  async listTeacherResponses(assignmentId){
    const {data,error}=await supabase.from("learning_content_responses").select("*").eq("assignment_id",assignmentId).order("submitted_at",{ascending:false});
    if(error)throw error;
    const rows = (data ?? []).map(mapContentResponse);
    const ids=[...new Set(rows.map(r=>r.studentUserId))];
    if(!ids.length)return[];
    const {data:users,error:userError}=await supabase.from("users").select("id,name,email").in("id",ids);
    if(userError)throw userError;
    const byId=new Map((users??[]).map(u=>[u.id,u]));
    return rows.map(r=>({ ...r, studentName:byId.get(r.studentUserId)?.name??r.studentUserId, studentEmail:byId.get(r.studentUserId)?.email??null }));
  },
  async gradeTeacherResponse(input){
    const {data,error}=await supabase.rpc("grade_learning_content_response",{p_response_id:input.responseId,p_score:input.score,p_max_score:input.maxScore,p_teacher_feedback:input.teacherFeedback??""});
    if(error)throw error;
    return String(data);
  },
  async saveStudentResponse(input){
    const submittedAt=input.status==="submitted"?new Date().toISOString():null;
    const {error:insertError}=await supabase.from("learning_content_responses").upsert({organization_id:input.organizationId,assignment_id:input.assignmentId,content_item_id:input.contentItemId,content_version_id:input.contentVersionId,student_user_id:input.studentUserId,response_text:input.responseText,status:input.status,submitted_at:submittedAt},{onConflict:"assignment_id,content_item_id,student_user_id",ignoreDuplicates:true});
    if(insertError)throw insertError;
    const existing=await learningContentRepository.getStudentResponse(input.assignmentId,input.contentItemId,input.studentUserId);
    if(!existing)throw new Error("The student response could not be loaded after saving.");
    if(existing.status==="submitted"){if(input.status==="submitted")return existing;throw new Error("This response has already been submitted and cannot be edited.");}
    const {data,error}=await supabase.from("learning_content_responses").update({response_text:input.responseText,status:input.status,submitted_at:submittedAt,updated_at:new Date().toISOString()}).eq("id",existing.id).select("*").single();
    if(error)throw error;
    return mapContentResponse(data);
  },
  async updateVersionStatus(id,status,_reviewerId){
    // The database RPC derives the reviewer from auth.uid(); caller-supplied identity is not trusted.
    void _reviewerId;
    const rpcClient=supabase as unknown as {
      rpc:(name:string,args:Record<string,unknown>)=>Promise<{data:ContentVersionRow|null;error:{message:string}|null}>
    };
    const{data,error}=await rpcClient.rpc("transition_learning_content_version_status",{
      p_content_version_id:id,
      p_status:status,
    });
    if(error)throw new Error(error.message);
    if(!data)throw new Error("Content-version transition returned no version record.");
    return mapContentVersion(data);
  },
};