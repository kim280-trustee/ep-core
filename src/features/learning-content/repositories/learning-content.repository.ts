import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningContentItem, LearningContentObjective, LearningContentVersion, LearningObjective,
  LearningObjectiveAlignment, LearningObjectivePrerequisite, LearningSkill, LearningTopic, LearningKnowledgeStatus,
  LearningContentStatus, LearningContentType,
} from "../types/learning-content.types";

type SkillRow = Database["public"]["Tables"]["learning_skills"]["Row"];
type TopicRow = Database["public"]["Tables"]["learning_topics"]["Row"];
type ObjectiveRow = Database["public"]["Tables"]["learning_objectives"]["Row"];
type PrerequisiteRow = Database["public"]["Tables"]["learning_objective_prerequisites"]["Row"];
type AlignmentRow = Database["public"]["Tables"]["learning_objective_alignments"]["Row"];
type ContentItemRow = Database["public"]["Tables"]["learning_content_items"]["Row"];
type ContentVersionRow = Database["public"]["Tables"]["learning_content_versions"]["Row"];
type ContentObjectiveRow = Database["public"]["Tables"]["learning_content_objectives"]["Row"];

export interface LearningContentRepository {
  listSkills(subjectId?: string): Promise<LearningSkill[]>;
  listTopics(skillId?: string): Promise<LearningTopic[]>;
  listObjectives(topicId?: string): Promise<LearningObjective[]>;
  listPrerequisites(objectiveId: string): Promise<LearningObjectivePrerequisite[]>;
  listAlignments(objectiveId?: string, curriculumId?: string, gradeLevelId?: string): Promise<LearningObjectiveAlignment[]>;
  listContent(organizationId?: string): Promise<LearningContentItem[]>;
  listContentVersions(contentItemId: string): Promise<LearningContentVersion[]>;
  listContentObjectives(contentItemId: string): Promise<LearningContentObjective[]>;
  createContent(input: { organizationId: string; code: string; title: string; contentType: LearningContentType; languageCode: string; createdBy: string }): Promise<LearningContentItem>;
  createVersion(input: { contentItemId: string; versionNo: number; body: Record<string, unknown>; changeSummary?: string | null; createdBy: string }): Promise<LearningContentVersion>;
  addObjective(input: { contentItemId: string; objectiveId: string; sequenceNo: number }): Promise<LearningContentObjective>;
  updateContentStatus(id: string, status: LearningContentStatus, reviewerId?: string): Promise<LearningContentItem>;
  updateVersionStatus(id: string, status: LearningContentStatus, reviewerId?: string): Promise<LearningContentVersion>;
}

const mapSkill = (r: SkillRow): LearningSkill => ({ id:r.id, subjectId:r.subject_id, code:r.code, name:r.name, description:r.description, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapTopic = (r: TopicRow): LearningTopic => ({ id:r.id, skillId:r.skill_id, code:r.code, name:r.name, description:r.description, sequenceNo:r.sequence_no, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapObjective = (r: ObjectiveRow): LearningObjective => ({ id:r.id, topicId:r.topic_id, code:r.code, name:r.name, description:r.description, sequenceNo:r.sequence_no, status:r.status as LearningKnowledgeStatus, createdAt:r.created_at, updatedAt:r.updated_at });
const mapPrerequisite = (r: PrerequisiteRow): LearningObjectivePrerequisite => ({ objectiveId:r.objective_id, prerequisiteObjectiveId:r.prerequisite_objective_id, createdAt:r.created_at });
const mapAlignment = (r: AlignmentRow): LearningObjectiveAlignment => ({ id:r.id, objectiveId:r.objective_id, curriculumId:r.curriculum_id, gradeLevelId:r.grade_level_id, sequenceNo:r.sequence_no, required:r.required, notes:r.notes, createdAt:r.created_at, updatedAt:r.updated_at });
const mapContentItem = (r: ContentItemRow): LearningContentItem => ({ id:r.id, organizationId:r.organization_id, code:r.code, title:r.title, contentType:r.content_type as LearningContentItem["contentType"], languageCode:r.language_code, status:r.status as LearningContentItem["status"], createdBy:r.created_by, updatedBy:r.updated_by, reviewedBy:r.reviewed_by, reviewedAt:r.reviewed_at, metadata:(r.metadata ?? {}) as Record<string,unknown>, createdAt:r.created_at, updatedAt:r.updated_at });
const mapContentVersion = (r: ContentVersionRow): LearningContentVersion => ({ id:r.id, contentItemId:r.content_item_id, versionNo:r.version_no, body:(r.body ?? {}) as Record<string,unknown>, changeSummary:r.change_summary, status:r.status as LearningContentVersion["status"], createdBy:r.created_by, reviewedBy:r.reviewed_by, reviewedAt:r.reviewed_at, publishedAt:r.published_at, createdAt:r.created_at, updatedAt:r.updated_at });
const mapContentObjective = (r: ContentObjectiveRow): LearningContentObjective => ({ contentItemId:r.content_item_id, objectiveId:r.objective_id, sequenceNo:r.sequence_no, createdAt:r.created_at });

export const learningContentRepository: LearningContentRepository = {
  async listSkills(subjectId) { let q=supabase.from("learning_skills").select("*").eq("status","active").order("name"); if(subjectId)q=q.eq("subject_id",subjectId); const {data,error}=await q;if(error)throw error;return(data??[]).map(mapSkill); },
  async listTopics(skillId) { let q=supabase.from("learning_topics").select("*").eq("status","active").order("sequence_no");if(skillId)q=q.eq("skill_id",skillId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapTopic); },
  async listObjectives(topicId) { let q=supabase.from("learning_objectives").select("*").eq("status","active").order("sequence_no");if(topicId)q=q.eq("topic_id",topicId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapObjective); },
  async listPrerequisites(objectiveId){const{data,error}=await supabase.from("learning_objective_prerequisites").select("*").eq("objective_id",objectiveId);if(error)throw error;return(data??[]).map(mapPrerequisite);},
  async listAlignments(objectiveId,curriculumId,gradeLevelId){let q=supabase.from("learning_objective_alignments").select("*").order("sequence_no");if(objectiveId)q=q.eq("objective_id",objectiveId);if(curriculumId)q=q.eq("curriculum_id",curriculumId);if(gradeLevelId)q=q.eq("grade_level_id",gradeLevelId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapAlignment);},
  async listContent(organizationId){let q=supabase.from("learning_content_items").select("*").order("updated_at",{ascending:false});if(organizationId)q=q.eq("organization_id",organizationId);const{data,error}=await q;if(error)throw error;return(data??[]).map(mapContentItem);},
  async listContentVersions(contentItemId){const{data,error}=await supabase.from("learning_content_versions").select("*").eq("content_item_id",contentItemId).order("version_no",{ascending:false});if(error)throw error;return(data??[]).map(mapContentVersion);},
  async listContentObjectives(contentItemId){const{data,error}=await supabase.from("learning_content_objectives").select("*").eq("content_item_id",contentItemId).order("sequence_no");if(error)throw error;return(data??[]).map(mapContentObjective);},
  async createContent(input){const{data,error}=await supabase.from("learning_content_items").insert({organization_id:input.organizationId,code:input.code,title:input.title,content_type:input.contentType,language_code:input.languageCode,created_by:input.createdBy}).select("*").single();if(error)throw error;return mapContentItem(data);},
  async createVersion(input){const{data,error}=await supabase.from("learning_content_versions").insert({content_item_id:input.contentItemId,version_no:input.versionNo,body:input.body as Json,change_summary:input.changeSummary??null,created_by:input.createdBy}).select("*").single();if(error)throw error;return mapContentVersion(data);},
  async addObjective(input){const{data,error}=await supabase.from("learning_content_objectives").insert({content_item_id:input.contentItemId,objective_id:input.objectiveId,sequence_no:input.sequenceNo}).select("*").single();if(error)throw error;return mapContentObjective(data);},
  async updateContentStatus(id,status,reviewerId){if(status==="published"){const{data:versions,error:versionError}=await supabase.from("learning_content_versions").select("id,version_no").eq("content_item_id",id).order("version_no",{ascending:false});if(versionError)throw versionError;if(!(versions??[]).length)throw new Error("Content needs at least one version before publishing.");const latestVersion=versions[0];const now=new Date().toISOString();const{error:publishVersionError}=await supabase.from("learning_content_versions").update({status:"published",published_at:now,reviewed_by:reviewerId??null,reviewed_at:reviewerId?now:null}).eq("id",latestVersion.id);if(publishVersionError)throw publishVersionError;}const patch:Database["public"]["Tables"]["learning_content_items"]["Update"]={status};if(reviewerId){patch.reviewed_by=reviewerId;patch.reviewed_at=new Date().toISOString();}const{data,error}=await supabase.from("learning_content_items").update(patch).eq("id",id).select("*").single();if(error)throw error;return mapContentItem(data);},
  async updateVersionStatus(id,status,reviewerId){const patch:Database["public"]["Tables"]["learning_content_versions"]["Update"]={status};if(reviewerId){patch.reviewed_by=reviewerId;patch.reviewed_at=new Date().toISOString();}if(status==="published")patch.published_at=new Date().toISOString();const{data,error}=await supabase.from("learning_content_versions").update(patch).eq("id",id).select("*").single();if(error)throw error;return mapContentVersion(data);},
};
