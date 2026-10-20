export type LearningInterventionCategory = "missing_assignment" | "assessment_result" | "learning_objective" | "teacher_observation" | "other";
export type LearningInterventionPriority = "low" | "normal" | "high";
export type LearningInterventionStatus = "open" | "in_progress" | "resolved";

export interface LearningInterventionCase {
  id: string;
  organizationId: string;
  classGroupId: string;
  className: string;
  classCode: string;
  studentUserId: string;
  studentName: string;
  category: LearningInterventionCategory;
  priority: LearningInterventionPriority;
  status: LearningInterventionStatus;
  title: string;
  notes: string;
  evidenceReference: string | null;
  reviewDate: string | null;
  outcome: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}
