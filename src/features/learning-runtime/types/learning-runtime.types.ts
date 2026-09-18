import type { LearningAssignment, LearningAssignmentProgress } from "@/features/learning-assignments";
import type { LearningActivityEvent } from "@/features/learning-activity";
import type { LearningRecommendation, LearningStudentMastery } from "@/features/learning-mastery";

export interface StudentLearningOverview {
  assignments: LearningAssignment[];
  progress: LearningAssignmentProgress[];
  mastery: LearningStudentMastery[];
  recommendations: LearningRecommendation[];
  recentActivity: LearningActivityEvent[];
}
export interface TeacherClassOverview {
  members: import("@/features/learning-enrollment").LearningClassMembership[];
  assignments: LearningAssignment[];
}