import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningActivityEvent, LearningActivityEventInput, LearningSession, LearningSessionInput } from "../types/learning-activity.types";

type SessionRow=Database["public"]["Tables"]["learning_sessions"]["Row"];
type EventRow=Database["public"]["Tables"]["learning_activity_events"]["Row"];
const rec=(v:Json):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const mapS=(r:SessionRow):LearningSession=>({id:r.id,tenantId:r.tenant_id,organizationId:r.organization_id,studentUserId:r.student_user_id,contextType:r.context_type as LearningSession["contextType"],contextId:r.context_id,startedAt:r.started_at,endedAt:r.ended_at,metadata:rec(r.metadata),createdAt:r.created_at});
const mapE=(r:EventRow):LearningActivityEvent=>({id:r.id,tenantId:r.tenant_id,organizationId:r.organization_id,studentUserId:r.student_user_id,sessionId:r.session_id,activityType:r.activity_type as LearningActivityEvent["activityType"],contentItemId:r.content_item_id,assessmentId:r.assessment_id,assignmentId:r.assignment_id,objectiveId:r.objective_id,metadata:rec(r.metadata),occurredAt:r.occurred_at});

export const learningActivityRepository = {
  async listRecentEvents(studentUserId:string,limit=20) {
    const {data,error}=await supabase.from("learning_activity_events").select("*").eq("student_user_id",studentUserId).order("occurred_at",{ascending:false}).limit(limit);
    if(error)throw error; return (data??[]).map(mapE);
  },
  async listSessions(studentUserId:string,limit=20) {
    const {data,error}=await supabase.from("learning_sessions").select("*").eq("student_user_id",studentUserId).order("started_at",{ascending:false}).limit(limit);
    if(error)throw error; return (data??[]).map(mapS);
  },
  async startSession(input:LearningSessionInput) {
    const {data,error}=await supabase.from("learning_sessions").insert({
      tenant_id:input.tenantId,organization_id:input.organizationId??null,student_user_id:input.studentUserId,
      context_type:input.contextType,context_id:input.contextId??null,metadata:(input.metadata??{}) as Json,
    }).select("*").single(); if(error)throw error; return mapS(data);
  },
  async endSession(id:string) {
    const {data,error}=await supabase.from("learning_sessions").update({ended_at:new Date().toISOString()}).eq("id",id).is("ended_at",null).select("*").single();
    if(error)throw error; return mapS(data);
  },
  async logEvent(input:LearningActivityEventInput) {
    const {data,error}=await supabase.from("learning_activity_events").insert({
      tenant_id:input.tenantId,organization_id:input.organizationId??null,student_user_id:input.studentUserId,session_id:input.sessionId??null,
      activity_type:input.activityType,content_item_id:input.contentItemId??null,assessment_id:input.assessmentId??null,assignment_id:input.assignmentId??null,
      objective_id:input.objectiveId??null,metadata:(input.metadata??{}) as Json,
    }).select("*").single(); if(error)throw error; return mapE(data);
  },
};