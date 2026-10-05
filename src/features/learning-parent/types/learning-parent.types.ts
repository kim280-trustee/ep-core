export interface LearningParentStudentLink { id:string; organizationId:string; parentUserId:string; studentUserId:string; relationship:string; status:"active"|"inactive"; createdAt:string; updatedAt:string; }
export interface LearningParentStudent { id:string; name:string; email:string; }
export interface LearningParentSubjectGrade { subjectName:string; score:number; grade:string|null; termName:string; finalizedAt:string|null; }
export interface LearningParentAssignment { id:string; title:string; dueAt:string|null; status:string; progressStatus:string; completedAt:string|null; }
export interface LearningParentMastery { objectiveId:string; objectiveName:string; objectiveDescription:string|null; score:number; state:string; }
export interface LearningParentComment { text:string; recordedAt:string; subjectName:string|null; termName:string|null; }
export interface LearningParentRecommendation { id:string; type:string; objectiveName:string|null; reason:string|null; priority:number; generatedAt:string; }
export interface LearningParentOverview { student:LearningParentStudent; subjectGrades:LearningParentSubjectGrade[]; assignments:LearningParentAssignment[]; mastery:LearningParentMastery[]; comments:LearningParentComment[]; recommendations:LearningParentRecommendation[]; }
export interface LearningParentInvitationInput { organizationId:string; parentEmail:string; parentName:string; studentUserId:string; relationship:string; }