import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningParentOverview, LearningParentStudent, LearningParentStudentLink } from "../types/learning-parent.types";

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

export const learningParentRepository={
  async listChildren(parentUserId:string):Promise<LearningParentStudentLink[]>{
    const{data,error}=await parentLinks().eq("parent_user_id",parentUserId).eq("status","active");if(error)throw error;
    return(data??[]).map(row=>({id:row.id,organizationId:row.organization_id,parentUserId:row.parent_user_id,studentUserId:row.student_user_id,relationship:row.relationship,status:row.status as "active"|"inactive",createdAt:row.created_at,updatedAt:row.updated_at}));
  },
  async listOrganizationUsers(organizationId:string):Promise<LearningParentStudent[]>{
    const{data:organization,error:organizationError}=await supabase.from("organizations").select("tenant_id").eq("id",organizationId).single();if(organizationError)throw organizationError;
    const{data,error}=await supabase.from("users").select("id,name,email").eq("tenant_id",organization.tenant_id).order("name");if(error)throw error;
    return(data??[]).map(row=>({id:row.id,name:row.name,email:row.email}));
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
  async acceptInvitation(invitationId:string){const{data,error}=await supabase.rpc("accept_learning_parent_invitation",{p_invitation_id:invitationId});if(error)throw error;return data as string;},
  async getOverview(studentUserId:string):Promise<LearningParentOverview>{
    const[{data:student,error:studentError},{data:grades,error:gradeError},{data:memberships,error:membershipError},{data:mastery,error:masteryError},{data:recommendations,error:recommendationError},{data:comments,error:commentError}]=await Promise.all([
      supabase.from("users").select("id,name,email").eq("id",studentUserId).single(),
      supabase.from("learning_term_grades").select("class_subject_id,term_id,score,letter_grade,status,finalized_at").eq("student_user_id",studentUserId).eq("status","finalized").order("finalized_at",{ascending:false}),
      supabase.from("learning_class_memberships").select("class_group_id").eq("user_id",studentUserId).eq("membership_type","student").eq("status","active"),
      supabase.from("learning_student_mastery").select("objective_id,mastery_score,state").eq("student_user_id",studentUserId).order("mastery_score",{ascending:true}),
      supabase.from("learning_recommendations").select("id,recommendation_type,objective_id,priority,reason,generated_at").eq("student_user_id",studentUserId).eq("status","active").order("priority",{ascending:false}),
      supabase.from("learning_gradebook_entries").select("comment,recorded_at,class_subject_id,term_id").eq("student_user_id",studentUserId).not("comment","is",null).order("recorded_at",{ascending:false}).limit(10),
    ]);
    if(studentError)throw studentError;if(gradeError)throw gradeError;if(membershipError)throw membershipError;if(masteryError)throw masteryError;if(recommendationError)throw recommendationError;if(commentError)throw commentError;

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

    const[{data:classSubjects,error:classSubjectError},{data:terms,error:termError},{data:directTargets,error:directTargetError},{data:classTargets,error:classTargetError},{data:commentSubjects,error:commentSubjectsError},{data:objectives,error:objectivesError}]=await Promise.all([
      subjectIds.length?supabase.from("learning_class_subjects").select("id,subject_id").in("id",subjectIds):Promise.resolve({data:[],error:null}),
      termIds.length?supabase.from("learning_terms").select("id,name").in("id",termIds):Promise.resolve({data:[],error:null}),
      supabase.from("learning_assignment_targets").select("assignment_id,student_user_id,class_group_id,status,due_at").eq("student_user_id",studentUserId).eq("status","active"),
      classGroupIds.length?supabase.from("learning_assignment_targets").select("assignment_id,student_user_id,class_group_id,status,due_at").in("class_group_id",classGroupIds).eq("status","active"):Promise.resolve({data:[],error:null}),
      commentSubjectIds.length?supabase.from("learning_class_subjects").select("id,subject_id").in("id",commentSubjectIds):Promise.resolve({data:[],error:null}),
      commentTermIds.length?supabase.from("learning_terms").select("id,name").in("id",commentTermIds):Promise.resolve({data:[],error:null}),
      objectiveIds.length?supabase.from("learning_objectives").select("id,name,description").in("id",objectiveIds):Promise.resolve({data:[],error:null}),
    ]);
    if(classSubjectError)throw classSubjectError;if(termError)throw termError;if(directTargetError)throw directTargetError;if(classTargetError)throw classTargetError;if(commentSubjectsError)throw commentSubjectsError;if(objectivesError)throw objectivesError;

    const subjectRefs=[...(classSubjects??[]),...(commentSubjects??[])] as SubjectRef[];
    const uniqueSubjectIds=[...new Set(subjectRefs.map(x=>x.subject_id))];
    const{data:subjects,error:subjectError}=uniqueSubjectIds.length?await supabase.from("learning_subjects").select("id,name").in("id",uniqueSubjectIds):{data:[],error:null};if(subjectError)throw subjectError;
    const subjectMap=new Map(((subjects??[]) as Subject[]).map(x=>[x.id,x.name]));
    const classSubjectMap=new Map((classSubjects??[]).map(x=>[x.id,x.subject_id]));
    const commentSubjectMap=new Map((commentSubjects??[]).map(x=>[x.id,x.subject_id]));
    const termMap=new Map(((terms??[]) as Term[]).map(x=>[x.id,x.name]));
    const objectiveMap=new Map(((objectives??[]) as Objective[]).map(x=>[x.id,x]));

    const targets=[...(directTargets??[]),...(classTargets??[])].filter((row,index,array)=>array.findIndex(x=>x.assignment_id===row.assignment_id&&x.student_user_id===row.student_user_id&&x.class_group_id===row.class_group_id)===index) as TargetRow[];
    const assignmentIds=[...new Set(targets.map(x=>x.assignment_id))];
    const[{data:assignments,error:assignmentError},{data:progress,error:progressError}]=await Promise.all([
      assignmentIds.length?supabase.from("learning_assignments").select("id,title,due_at,status").in("id",assignmentIds):Promise.resolve({data:[],error:null}),
      assignmentIds.length?supabase.from("learning_assignment_progress").select("assignment_id,status,completed_at,updated_at").eq("student_user_id",studentUserId).in("assignment_id",assignmentIds):Promise.resolve({data:[],error:null}),
    ]);
    if(assignmentError)throw assignmentError;if(progressError)throw progressError;
    const assignmentMap=new Map(((assignments??[]) as AssignmentRow[]).map(x=>[x.id,x]));
    const progressMap=new Map<string,ProgressRow>();
    for(const row of(progress??[]) as ProgressRow[])if(!progressMap.has(row.assignment_id))progressMap.set(row.assignment_id,row);

    const reasonText=(reason:unknown)=>{if(typeof reason==="string")return reason;if(reason&&typeof reason==="object"){const r=reason as Record<string,unknown>;return String(r.message??r.reason??r.explanation??"");}return "";};

    return{
      student:{id:student.id,name:student.name??"Student",email:student.email},
      subjectGrades:gradeRows.map(row=>({subjectName:subjectMap.get(classSubjectMap.get(row.class_subject_id)??"")??"Subject",score:Number(row.score),grade:row.letter_grade,termName:termMap.get(row.term_id)??"Term",finalizedAt:row.finalized_at})),
      assignments:[...assignmentMap.values()].map(a=>{const p=progressMap.get(a.id);const target=targets.find(x=>x.assignment_id===a.id);return{id:a.id,title:a.title,dueAt:target?.due_at??a.due_at,status:a.status,progressStatus:p?.status??"not_started",completedAt:p?.completed_at??null};}).sort((a,b)=>(a.dueAt??"9999").localeCompare(b.dueAt??"9999")),
      mastery:masteryRows.map(row=>{const o=objectiveMap.get(row.objective_id);return{objectiveId:row.objective_id,objectiveName:o?.name??"Learning objective",objectiveDescription:o?.description??null,score:Number(row.mastery_score),state:row.state};}),
      comments:commentRows.map(row=>({text:row.comment??"",recordedAt:row.recorded_at,subjectName:subjectMap.get(commentSubjectMap.get(row.class_subject_id)??"")??null,termName:termMap.get(row.term_id)??null})),
      recommendations:recommendationRows.map(row=>({id:row.id,type:row.recommendation_type,objectiveName:row.objective_id?objectiveMap.get(row.objective_id)?.name??null:null,reason:reasonText(row.reason),priority:row.priority,generatedAt:row.generated_at})),
    };
  },
};