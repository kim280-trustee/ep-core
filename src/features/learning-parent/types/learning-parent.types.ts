export interface LearningParentStudentLink { id:string; organizationId:string; parentUserId:string; studentUserId:string; relationship:string; status:"active"|"inactive"; createdAt:string; updatedAt:string; }
export interface LearningParentStudent { id:string; name:string; email:string; }
export interface LearningParentSubjectGrade { subjectName:string; score:number; grade:string|null; termName:string; finalizedAt:string|null; }
export interface LearningParentAssignment { id:string; title:string; dueAt:string|null; status:string; progressStatus:string; completedAt:string|null; }
export interface LearningParentMastery { objectiveId:string; score:number; state:string; }
export interface LearningParentOverview { student:LearningParentStudent; subjectGrades:LearningParentSubjectGrade[]; assignments:LearningParentAssignment[]; mastery:LearningParentMastery[]; comments:string[]; recommendations:number; }
