export interface LearningGradebookEntry {
  id: string;
  tenantId: string;
  organizationId: string;
  termId: string;
  classGroupId: string;
  classSubjectId: string;
  studentUserId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  recordType: "assessment" | "assignment" | "exam" | "manual" | string;
  sourceType: "assessment_result" | "assignment" | "manual" | string;
  assignmentId: string | null;
  assessmentId: string | null;
  attemptId: string | null;
  assessmentResultId: string | null;
  topicId: string | null;
  objectiveId: string | null;
  score: number;
  maxScore: number;
  percentage: number | null;
  weight: number;
  includedInGrade: boolean;
  recordedAt: string;
  notes: Record<string, unknown>;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  comment: string | null;
  late: boolean;
}

export interface LearningTermGrade {
  id: string;
  tenantId: string;
  organizationId: string;
  termId: string;
  classGroupId: string;
  classSubjectId: string;
  studentUserId: string;
  score: number;
  letterGrade: string | null;
  status: "draft" | "finalized" | string;
  calculation: Record<string, unknown>;
  finalizedAt: string | null;
  finalizedBy: string | null;
  notes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  overrideScore: number | null;
  overrideGrade: string | null;
  overrideReason: string | null;
}

export interface LearningGradebookQuery {
  organizationId: string;
  classGroupId: string;
  classSubjectId: string;
  termId: string;
}
