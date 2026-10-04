import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningParentOverview, LearningParentStudentLink } from "../types/learning-parent.types";



type GradeRow = { class_subject_id:string; term_id:string; score:number|string; letter_grade:string|null; status:string; finalized_at:string|null; };
type AssignmentRow = { id:string; title:string; due_at:string|null; status:string };
type ProgressRow = { assignment_id:string; status:string; completed_at:string|null };
type SubjectRow = { id:string; subject_id:string; };
type Subject = { id:string; name:string };
type TermRow = { id:string; name:string };

const parentLinks = () => supabase.from("learning_parent_student_links").select("*");

export const learningParentRepository = {
  async listChildren(parentUserId:string):Promise<LearningParentStudentLink[]> {
    const {data,error}=await parentLinks().eq("parent_user_id",parentUserId).eq("status","active");
    if(error)throw error;
    return (data??[]).map((row)=>({id:row.id,organizationId:row.organization_id,parentUserId:row.parent_user_id,studentUserId:row.student_user_id,relationship:row.relationship,status:row.status as "active"|"inactive",createdAt:row.created_at,updatedAt:row.updated_at}));
  },
  async getOverview(studentUserId:string):Promise<LearningParentOverview>{
    const [{data:student,error:studentError},{data:grades,error:gradeError},{data:progress,error:progressError},{data:mastery,error:masteryError},{data:recommendations,error:recommendationError},{data:comments,error:commentError}]=await Promise.all([
      supabase.from("users").select("id,name,email").eq("id",studentUserId).single(),
      supabase.from("learning_term_grades").select("class_subject_id,term_id,score,letter_grade,status,finalized_at").eq("student_user_id",studentUserId).eq("status","finalized").order("finalized_at",{ascending:false}),
      supabase.from("learning_assignment_progress").select("assignment_id,status,completed_at").eq("student_user_id",studentUserId).order("updated_at",{ascending:false}),
      supabase.from("learning_student_mastery").select("objective_id,mastery_score,state").eq("student_user_id",studentUserId).order("mastery_score",{ascending:true}),
      supabase.from("learning_recommendations").select("id").eq("student_user_id",studentUserId).eq("status","active"),
      supabase.from("learning_gradebook_entries").select("comment,recorded_at").eq("student_user_id",studentUserId).not("comment","is",null).order("recorded_at",{ascending:false}).limit(10),
    ]);
    if(studentError)throw studentError;if(gradeError)throw gradeError;if(progressError)throw progressError;if(masteryError)throw masteryError;if(recommendationError)throw recommendationError;if(commentError)throw commentError;

    const gradeRows=(grades??[]) as GradeRow[];
    const subjectIds=[...new Set(gradeRows.map(x=>x.class_subject_id))];
    const termIds=[...new Set(gradeRows.map(x=>x.term_id))];
    const assignmentIds=[...new Set(((progress??[]) as ProgressRow[]).map(x=>x.assignment_id))];
    const [{data:classSubjects,error:classSubjectError},{data:terms,error:termError},{data:assignments,error:assignmentError}]=await Promise.all([
      subjectIds.length?supabase.from("learning_class_subjects").select("id,subject_id").in("id",subjectIds):Promise.resolve({data:[],error:null}),
      termIds.length?supabase.from("learning_terms").select("id,name").in("id",termIds):Promise.resolve({data:[],error:null}),
      assignmentIds.length?supabase.from("learning_assignments").select("id,title,due_at,status").in("id",assignmentIds):Promise.resolve({data:[],error:null}),
    ]);
    if(classSubjectError)throw classSubjectError;if(termError)throw termError;if(assignmentError)throw assignmentError;
    const subjectRef=(classSubjects??[]) as SubjectRow[];
    const subjectRefIds=[...new Set(subjectRef.map(x=>x.subject_id))];
    const {data:subjects,error:subjectsError}=subjectRefIds.length?await supabase.from("learning_subjects").select("id,name").in("id",subjectRefIds):{data:[],error:null};
    if(subjectsError)throw subjectsError;
    const subjectMap=new Map(((subjects??[]) as Subject[]).map(x=>[x.id,x.name]));
    const classSubjectMap=new Map(subjectRef.map(x=>[x.id,x.subject_id]));
    const termMap=new Map(((terms??[]) as TermRow[]).map(x=>[x.id,x.name]));
    const assignmentMap=new Map(((assignments??[]) as AssignmentRow[]).map(x=>[x.id,x]));


    return {
      student:{id:student.id,name:student.name??"Student",email:student.email},
      subjectGrades:gradeRows.map(row=>({subjectName:subjectMap.get(classSubjectMap.get(row.class_subject_id)??"")??"Subject",score:Number(row.score),grade:row.letter_grade,termName:termMap.get(row.term_id)??"Term",finalizedAt:row.finalized_at})),
      assignments:((progress??[]) as ProgressRow[]).map(row=>{const assignment=assignmentMap.get(row.assignment_id);return assignment?{id:assignment.id,title:assignment.title,dueAt:assignment.due_at,status:assignment.status,progressStatus:row.status,completedAt:row.completed_at}:null}).filter((x):x is NonNullable<typeof x>=>Boolean(x)),
      mastery:((mastery??[]) as Array<{objective_id:string;mastery_score:number|string;state:string}>).map(row=>({objectiveId:row.objective_id,score:Number(row.mastery_score),state:row.state})),
      comments:((comments??[]) as Array<{comment:string|null}>).map(x=>x.comment).filter((x):x is string=>Boolean(x)),
      recommendations:(recommendations??[]).length,
    };
  },
};



