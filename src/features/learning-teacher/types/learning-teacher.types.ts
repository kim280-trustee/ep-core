import type { LearningAssignment } from "@/features/learning-assignments";
import type { LearningClassGroup, LearningClassSubject, LearningSubject } from "@/features/learning-academic";
import type { LearningClassMembership } from "@/features/learning-enrollment";

export interface LearningTeacherClass {
  classGroup: LearningClassGroup;
  subjects: Array<LearningClassSubject & { subject: LearningSubject }>;
  membership: LearningClassMembership;
}

export interface LearningTeacherStudent {
  membership: LearningClassMembership;
  name: string;
  email: string;
}

export interface LearningAssignmentMonitor {
  assignment: LearningAssignment;
  studentCount: number;
  startedCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface LearningTeacherClassOverview {
  classInfo: LearningTeacherClass;
  students: LearningTeacherStudent[];
  assignments: LearningAssignmentMonitor[];
}
