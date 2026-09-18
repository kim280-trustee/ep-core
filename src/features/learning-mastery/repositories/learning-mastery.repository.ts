import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningMasteryEvent, LearningRecommendation, LearningStudentMastery } from "../types/learning-mastery.types";

type MasteryRow = Database["public"]["Tables"]["learning_student_mastery"]["Row"];
type EventRow = Database["public"]["Tables"]["learning_mastery_events"]["Row"];
type RecommendationRow = Database["public"]["Tables"]["learning_recommendations"]["Row"];

const record = (v: Json): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};

const mapMastery = (r: MasteryRow): LearningStudentMastery => ({
  id:r.id, tenantId:r.tenant_id, organizationId:r.organization_id, studentUserId:r.student_user_id,
  objectiveId:r.objective_id, masteryScore:r.mastery_score, confidenceScore:r.confidence_score,
  state:r.state as LearningStudentMastery["state"], attemptsCount:r.attempts_count, correctCount:r.correct_count,
  lastAssessedAt:r.last_assessed_at, nextReviewAt:r.next_review_at, createdAt:r.created_at, updatedAt:r.updated_at,
});
const mapEvent = (r: EventRow): LearningMasteryEvent => ({
  id:r.id, tenantId:r.tenant_id, organizationId:r.organization_id, studentUserId:r.student_user_id,
  objectiveId:r.objective_id, attemptId:r.attempt_id, previousScore:r.previous_score, newScore:r.new_score,
  evidence:record(r.evidence), createdAt:r.created_at,
});
const mapRecommendation = (r: RecommendationRow): LearningRecommendation => ({
  id:r.id, tenantId:r.tenant_id, organizationId:r.organization_id, studentUserId:r.student_user_id,
  recommendationType:r.recommendation_type as LearningRecommendation["recommendationType"], objectiveId:r.objective_id,
  contentItemId:r.content_item_id, assessmentId:r.assessment_id, priority:r.priority, reason:record(r.reason),
  status:r.status as LearningRecommendation["status"], generatedAt:r.generated_at, expiresAt:r.expires_at,
  completedAt:r.completed_at, createdAt:r.created_at, updatedAt:r.updated_at,
});

export const learningMasteryRepository = {
  async listStudentMastery(studentUserId:string) {
    const {data,error}=await supabase.from("learning_student_mastery").select("*").eq("student_user_id",studentUserId).order("mastery_score");
    if(error) throw error; return (data??[]).map(mapMastery);
  },
  async listMasteryEvents(studentUserId:string) {
    const {data,error}=await supabase.from("learning_mastery_events").select("*").eq("student_user_id",studentUserId).order("created_at",{ascending:false});
    if(error) throw error; return (data??[]).map(mapEvent);
  },
  async listRecommendations(studentUserId:string) {
    const {data,error}=await supabase.from("learning_recommendations").select("*").eq("student_user_id",studentUserId).eq("status","active").order("priority",{ascending:false});
    if(error) throw error; return (data??[]).map(mapRecommendation);
  },
  async completeRecommendation(id:string) {
    const {data,error}=await supabase.from("learning_recommendations").update({status:"completed",completed_at:new Date().toISOString()}).eq("id",id).select("*").single();
    if(error) throw error; return mapRecommendation(data);
  },
};
