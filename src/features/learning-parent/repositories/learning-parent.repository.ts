import { supabase } from "@/core/infrastructure/supabase/client";
import { learningActivityService } from "@/features/learning-activity";
import { calculateLearningStreak, getVerifiedLearningActivityTimestamps } from "@/features/learning-rewards";
import type { LearningParentAttendanceSummary, LearningParentOverview, LearningParentStudent, LearningParentStudentLink } from "../types/learning-parent.types";

type GradeRow={class_subject_id:string;term_id:string;score:number|string;letter_grade:string|null;status:string;finalized_at:string|null};
type AssignmentRow={id:string;title:string;due_at:string|null;status:string};
type ProgressRow={assignment_id:string;status:string;completed_at:string|null;updated_at?:string};
type TargetRow={assignment_id:string;student_user_id:string|null;class_group_id:string|null;status:string;due_at:string|null};
type SubjectRef={id:string;subject_id:string};
type Subject={id:string;name:string};
type Term={id:string;name:string};
type CommentRow={comment:string|null;recorded_at:string;class_subject_id:string;term_id:string};
type Objective={id:string;name:string;description:string|null};
type MasteryRow={objective_id:string;mastery_score:number|string;state:string};
type RecommendationRow={id:string;recommendation_type:string;objective_id:string|null;priority:number;reason:unknown;generated_at:string};

const parentLinks=()=>supabase.from("learning_parent_student_links").select("*");

const parentPreferenceRpc = supabase as unknown as {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
};

export const learningParentRepository={
  async getLanguagePreference(): Promise<"en" | "th"> {
    const { data, error } = await parentPreferenceRpc.rpc(
      "get_learning_parent_language_preference",
      {},
    );
    if (error) throw new Error(error.message);
    return data === "th" ? "th" : "en";
  },
  async setLanguagePreference(language: "en" | "th"): Promise<"en" | "th"> {
    const { data, error } = await parentPreferenceRpc.rpc(
      "set_learning_parent_language_preference",
      { p_language: language },
    );
    if (error) throw new Error(error.message);
    if (data !== "en" && data !== "th") {
      throw new Error("The saved language preference was not recognized.");
    }
    return data;
  },
  async listChildren(parentUserId:string):Promise<LearningParentStudentLink[]>{
    const{data,error}=await parentLinks().eq("parent_user_id",parentUserId).eq("status","active");if(error)throw error;
    return(data??[]).map(row=>({id:row.id,organizationId:row.organization_id,parentUserId:row.parent_user_id,studentUserId:row.student_user_id,relationship:row.relationship,status:row.status as "active"|"inactive",createdAt:row.created_at,updatedAt:row.updated_at}));
  },
  async listOrganizationUsers(organizationId:string):Promise<LearningParentStudent[]>{
    const{data:organization,error:organizationError}=await supabase.from("organizations").select("tenant_id").eq("id",organizationId).single();if(organizationError)throw organizationError;
    const[{data:memberships,error:membershipError},{data:links,error:linksError}]=await Promise.all([
      supabase.from("organization_memberships").select("user_id").eq("organization_id",organizationId).eq("status","active"),
      supabase.from("learning_parent_student_links").select("parent_user_id,student_user_id").eq("organization_id",organizationId),
    ]);
    if(membershipError)throw membershipError;if(linksError)throw linksError;
    const userIds=[...new Set([...(memberships??[]).map(row=>row.user_id),...(links??[]).flatMap(row=>[row.parent_user_id,row.student_user_id])])];
    if(!userIds.length)return [];
    const{data,error}=await supabase.from("users").select("id,name,email").eq("tenant_id",organization.tenant_id).in("id",userIds).order("name");if(error)throw error;
    return(data??[]).map(row=>({id:row.id,name:row.name??"Unnamed user",email:row.email??""}));
  },
  async listOrganizationStudents(organizationId:string):Promise<LearningParentStudent[]>{
    const{data:organization,error:organizationError}=await supabase.from("organizations").select("tenant_id").eq("id",organizationId).single();if(organizationError)throw organizationError;
    const{data:memberships,error:membershipError}=await supabase.from("learning_class_memberships").select("user_id").eq("organization_id",organizationId).eq("membership_type","student").eq("status","active");if(membershipError)throw membershipError;
    const userIds=[...new Set((memberships??[]).map(row=>row.user_id))];if(!userIds.length)return [];
    const{data,error}=await supabase.from("users").select("id,name,email").eq("tenant_id",organization.tenant_id).in("id",userIds).order("name");if(error)throw error;
    return(data??[]).map(row=>({id:row.id,name:row.name??"Unnamed user",email:row.email??""}));
  },
  async listLinks(organizationId:string):Promise<LearningParentStudentLink[]>{
    const{data,error}=await parentLinks().eq("organization_id",organizationId).order("created_at",{ascending:false});if(error)throw error;
    return(data??[]).map(row=>({id:row.id,organizationId:row.organization_id,parentUserId:row.parent_user_id,studentUserId:row.student_user_id,relationship:row.relationship,status:row.status as "active"|"inactive",createdAt:row.created_at,updatedAt:row.updated_at}));
  },
  async createLink(input:{organizationId:string;parentUserId:string;studentUserId:string;relationship:string;createdBy:string}):Promise<LearningParentStudentLink>{
    if(input.parentUserId===input.studentUserId)throw new Error("A parent account cannot be linked to itself as a student.");
    const{data,error}=await supabase.from("learning_parent_student_links").upsert({organization_id:input.organizationId,parent_user_id:input.parentUserId,student_user_id:input.studentUserId,relationship:input.relationship.trim()||"parent",status:"active",created_by:input.createdBy,updated_at:new Date().toISOString()},{onConflict:"organization_id,parent_user_id,student_user_id"}).select("*").single();if(error)throw error;
    return{id:data.id,organizationId:data.organization_id,parentUserId:data.parent_user_id,studentUserId:data.student_user_id,relationship:data.relationship,status:data.status as "active"|"inactive",createdAt:data.created_at,updatedAt:data.updated_at};
  },
  async setLinkStatus(id:string,status:"active"|"inactive"):Promise<LearningParentStudentLink>{
    const{data,error}=await supabase.from("learning_parent_student_links").update({status,updated_at:new Date().toISOString()}).eq("id",id).select("*").single();if(error)throw error;
    return{id:data.id,organizationId:data.organization_id,parentUserId:data.parent_user_id,studentUserId:data.student_user_id,relationship:data.relationship,status:data.status as "active"|"inactive",createdAt:data.created_at,updatedAt:data.updated_at};
  },
  async inviteParent(input:{organizationId:string;parentEmail:string;parentName:string;studentUserId:string;relationship:string}){
    const{data,error}=await supabase.functions.invoke("invite-parent",{body:input});if(error)throw error;if(data?.error)throw new Error(data.error);return data as{invitationId:string;sent:boolean};
  },
  async acceptInvitation(invitationId:string){const{data,error}=await supabase.rpc("accept_learning_parent_invitation",{p_invitation_id:invitationId});if(error)throw error;if(typeof data!=="string"||!data)throw new Error("This invitation has expired or is no longer active.");return data as string;},
  async getVocabularySummary(studentUserId: string): Promise<{
    vocabularyCount: number;
    practicedCount: number;
    knownCount: number;
    dueCount: number;
    reviewAttempts: number;
    accuracyPercent: number | null;
    organizationCount: number;
  }> {
    const rpcClient = supabase as unknown as {
      rpc: (name: string, args: Record<string, unknown>) => Promise<{
        data: unknown;
        error: { message: string } | null;
      }>;
    };
    const { data, error } = await rpcClient.rpc("get_learning_parent_vocabulary_summary", {
      p_student_user_id: studentUserId,
    });
    if (error) throw new Error(error.message);
    const rows = Array.isArray(data) ? data as Array<Record<string, unknown>> : [];
    const total = (key: string) => rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0);
    const vocabularyCount = total("vocabulary_count");
    const practicedCount = total("practiced_count");
    const knownCount = total("known_count");
    const dueCount = total("due_count");
    const reviewAttempts = total("review_attempts");
    const correctAnswers = total("correct_answers");
    const answeredCount = total("answered_count");
    return {
      vocabularyCount,
      practicedCount,
      knownCount,
      dueCount,
      reviewAttempts,
      accuracyPercent: answeredCount > 0 ? Math.round((correctAnswers / answeredCount) * 1000) / 10 : null,
      organizationCount: rows.length,
    };
  },

  async getAttendanceSummary(studentUserId: string): Promise<LearningParentAttendanceSummary> {
    const rpcClient = supabase as unknown as {
      rpc: (name: string, args: Record<string, unknown>) => Promise<{
        data: unknown;
        error: { message: string } | null;
      }>;
    };
    const { data, error } = await rpcClient.rpc("get_learning_parent_attendance_summary", {
      p_student_user_id: studentUserId,
      p_limit: 30,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
    return {
      sessionsCount: Number(row?.sessions_count ?? 0),
      presentCount: Number(row?.present_count ?? 0),
      absentCount: Number(row?.absent_count ?? 0),
      lateCount: Number(row?.late_count ?? 0),
      excusedCount: Number(row?.excused_count ?? 0),
      latestAttendanceDate: row?.latest_attendance_date ? String(row.latest_attendance_date) : null,
    };
  },

  async getOverview(studentUserId:string):Promise<LearningParentOverview>{
    const[{data:student,error:studentError},{data:grades,error:gradeError},{data:memberships,error:membershipError},{data:mastery,error:masteryError},{data:recommendations,error:recommendationError},{data:comments,error:commentError},{data:rewardRows,error:rewardError},{data:notificationRows,error:notificationError},{data:badgeRows,error:badgeError},verifiedContentCompletions]=await Promise.all([
      supabase.from("users").select("id,name,email").eq("id",studentUserId).single(),
      supabase.from("learning_term_grades").select("class_subject_id,term_id,score,letter_grade,status,finalized_at").eq("student_user_id",studentUserId).eq("status","finalized").order("finalized_at",{ascending:false}),
      supabase.from("learning_class_memberships").select("class_group_id").eq("user_id",studentUserId).eq("membership_type","student").eq("status","active"),
      supabase.from("learning_student_mastery").select("objective_id,mastery_score,state").eq("student_user_id",studentUserId).order("mastery_score",{ascending:true}),
      supabase.from("learning_recommendations").select("id,recommendation_type,objective_id,priority,reason,generated_at").eq("student_user_id",studentUserId).eq("status","active").order("priority",{ascending:false}),
      supabase.from("learning_gradebook_entries").select("comment,recorded_at,class_subject_id,term_id").eq("student_user_id",studentUserId).not("comment","is",null).order("recorded_at",{ascending:false}).limit(10),
      supabase.from("learning_reward_ledger").select("id,event_type,xp_delta,occurred_at,metadata").eq("student_user_id",studentUserId).order("occurred_at",{ascending:false}),
      supabase.from("learning_reward_notifications").select("id,title,message,created_at,read_at").eq("student_user_id",studentUserId).order("created_at",{ascending:false}).limit(5),
      supabase.rpc("get_learning_parent_badge_awards",{p_student_user_id:studentUserId}),
      learningActivityService.listValidatedContentCompletions(studentUserId),
    ]);
    if(studentError)throw studentError;if(gradeError)throw gradeError;if(membershipError)throw membershipError;if(masteryError)throw masteryError;if(recommendationError)throw recommendationError;if(commentError)throw commentError;if(rewardError)throw rewardError;if(notificationError)throw notificationError;if(badgeError)throw badgeError;

    const gradeRows=(grades??[]) as GradeRow[];
    const classGroupIds=[...new Set((memberships??[]).map(x=>x.class_group_id).filter((x):x is string=>Boolean(x)))];
    const subjectIds=[...new Set(gradeRows.map(x=>x.class_subject_id))];
    const termIds=[...new Set(gradeRows.map(x=>x.term_id))];
    const commentRows=(comments??[]) as CommentRow[];
    const commentSubjectIds=[...new Set(commentRows.map(x=>x.class_subject_id))];
    const commentTermIds=[...new Set(commentRows.map(x=>x.term_id))];
    const masteryRows=(mastery??[]) as MasteryRow[];
    const recommendationRows=(recommendations??[]) as RecommendationRow[];
    const objectiveIds=[...new Set([...masteryRows.map(x=>x.objective_id),...recommendationRows.map(x=>x.objective_id).filter((x):x is string=>Boolean(x))])];

    const[{data:classSubjects,error:classSubjectError},{data:terms,error:termError},{data:directTargets,error:directTargetError},{data:classTargets,error:classTargetError},{data:commentSubjects,error:commentSubjectsError},{error:commentTermsError},{data:objectives,error:objectivesError}]=await Promise.all([
      subjectIds.length?supabase.from("learning_class_subjects").select("id,subject_id").in("id",subjectIds):Promise.resolve({data:[],error:null}),
      termIds.length?supabase.from("learning_terms").select("id,name").in("id",termIds):Promise.resolve({data:[],error:null}),
      supabase.from("learning_assignment_targets").select("assignment_id,student_user_id,class_group_id,status,due_at").eq("student_user_id",studentUserId).eq("status","active"),
      classGroupIds.length?supabase.from("learning_assignment_targets").select("assignment_id,student_user_id,class_group_id,status,due_at").in("class_group_id",classGroupIds).eq("status","active"):Promise.resolve({data:[],error:null}),
      commentSubjectIds.length?supabase.from("learning_class_subjects").select("id,subject_id").in("id",commentSubjectIds):Promise.resolve({data:[],error:null}),
      commentTermIds.length?supabase.from("learning_terms").select("id,name").in("id",commentTermIds):Promise.resolve({data:[],error:null}),
      objectiveIds.length?supabase.from("learning_objectives").select("id,name,description").in("id",objectiveIds):Promise.resolve({data:[],error:null}),
    ]);
    if(classSubjectError)throw classSubjectError;if(termError)throw termError;if(directTargetError)throw directTargetError;if(classTargetError)throw classTargetError;if(commentSubjectsError)throw commentSubjectsError;if(commentTermsError)throw commentTermsError;if(objectivesError)throw objectivesError;

    const subjectRefs=[...(classSubjects??[]),...(commentSubjects??[])] as SubjectRef[];
    const uniqueSubjectIds=[...new Set(subjectRefs.map(x=>x.subject_id))];
    const{data:subjects,error:subjectError}=uniqueSubjectIds.length?await supabase.from("learning_subjects").select("id,name").in("id",uniqueSubjectIds):{data:[],error:null};if(subjectError)throw subjectError;
    const subjectMap=new Map(((subjects??[]) as Subject[]).map(x=>[x.id,x.name]));
    const classSubjectMap=new Map((classSubjects??[]).map(x=>[x.id,x.subject_id]));
    const commentSubjectMap=new Map((commentSubjects??[]).map(x=>[x.id,x.subject_id]));
    const termMap=new Map(((terms??[]) as Term[]).map(x=>[x.id,x.name]));
    const objectiveMap=new Map(((objectives??[]) as Objective[]).map(x=>[x.id,x]));

    const targets=[...(directTargets??[]),...(classTargets??[]).filter((row)=>!row.student_user_id||row.student_user_id===studentUserId)].filter((row,index,array)=>array.findIndex(x=>x.assignment_id===row.assignment_id&&x.student_user_id===row.student_user_id&&x.class_group_id===row.class_group_id)===index) as TargetRow[];
    const assignmentIds=[...new Set(targets.map(x=>x.assignment_id))];
    const[{data:assignments,error:assignmentError},{data:progress,error:progressError}]=await Promise.all([
      assignmentIds.length?supabase.from("learning_assignments").select("id,title,due_at,status").in("id",assignmentIds).eq("status","published"):Promise.resolve({data:[],error:null}),
      assignmentIds.length?supabase.from("learning_assignment_progress").select("assignment_id,status,completed_at,updated_at").eq("student_user_id",studentUserId).in("assignment_id",assignmentIds):Promise.resolve({data:[],error:null}),
    ]);
    if(assignmentError)throw assignmentError;if(progressError)throw progressError;
    const assignmentMap=new Map(((assignments??[]) as AssignmentRow[]).map(x=>[x.id,x]));
    const progressMap=new Map<string,ProgressRow>();
    const progressPriority=(status:string)=>status==="completed"?0:status==="in_progress"?1:2;
    for(const row of(progress??[]) as ProgressRow[]){
      const current=progressMap.get(row.assignment_id);
      if(!current||progressPriority(row.status)<progressPriority(current.status)||(row.status===current.status&&(row.updated_at??"")>(current.updated_at??""))){
        progressMap.set(row.assignment_id,row);
      }
    }

    const reasonText=(reason:unknown)=>{if(typeof reason==="string")return reason;if(reason&&typeof reason==="object"){const r=reason as Record<string,unknown>;return String(r.message??r.reason??r.explanation??"");}return "";};

    return{
      student:{id:student.id,name:student.name??"Student",email:student.email},
      subjectGrades:gradeRows.map(row=>({subjectName:subjectMap.get(classSubjectMap.get(row.class_subject_id)??"")??"Subject",score:Number(row.score),grade:row.letter_grade,termName:termMap.get(row.term_id)??"Term",finalizedAt:row.finalized_at})),
      assignments:[...assignmentMap.values()].map(a=>{const p=progressMap.get(a.id);const target=targets.find(x=>x.assignment_id===a.id);return{id:a.id,title:a.title,dueAt:target?.due_at??a.due_at,status:a.status,progressStatus:p?.status??"not_started",completedAt:p?.completed_at??null};}).sort((a,b)=>(a.dueAt??"9999").localeCompare(b.dueAt??"9999")),
      mastery:masteryRows.map(row=>{const o=objectiveMap.get(row.objective_id);return{objectiveId:row.objective_id,objectiveName:o?.name??"Learning objective",objectiveDescription:o?.description??null,score:Number(row.mastery_score),state:row.state};}),
      comments:commentRows.map(row=>({text:row.comment??"",recordedAt:row.recorded_at,subjectName:subjectMap.get(commentSubjectMap.get(row.class_subject_id)??"")??null,termName:termMap.get(row.term_id)??null})),
      recommendations:recommendationRows.map(row=>({id:row.id,type:row.recommendation_type,objectiveName:row.objective_id?objectiveMap.get(row.objective_id)?.name??null:null,reason:reasonText(row.reason),priority:row.priority,generatedAt:row.generated_at})),
      xpTotal:(rewardRows??[]).reduce((sum,row)=>sum+row.xp_delta,0),
      currentStreak: calculateLearningStreak(
        getVerifiedLearningActivityTimestamps(
          verifiedContentCompletions,
          (rewardRows ?? []).map((row) => ({ eventType: row.event_type, occurredAt: row.occurred_at })),
        ),
      ),
      badgesUnlocked:(badgeRows??[]).map(row=>row.badge_title),
      recentRewards:(rewardRows??[]).slice(0,5).map(row=>({id:row.id,eventType:row.event_type,xpDelta:row.xp_delta,occurredAt:row.occurred_at})),
      recentRewardNotifications:(notificationRows??[]).map(row=>({id:row.id,title:row.title,message:row.message,createdAt:row.created_at,readAt:row.read_at})),
    };
  },
};
