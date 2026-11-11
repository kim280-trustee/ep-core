export type LearningTeacherLeaveType = "annual" | "sick" | "personal" | "other";
export type LearningTeacherLeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
export type LearningTeacherCoverageStatus = "assigned" | "cancelled";

export interface LearningTeacherLeaveRequest {
  id: string;
  tenantId: string;
  organizationId: string;
  teacherUserId: string;
  startDate: string;
  endDate: string;
  leaveType: LearningTeacherLeaveType;
  reason: string;
  status: LearningTeacherLeaveStatus;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningTeacherSubstituteCoverage {
  id: string;
  tenantId: string;
  organizationId: string;
  leaveRequestId: string;
  timetableEntryId: string;
  classGroupId: string;
  coverageDate: string;
  absentTeacherUserId: string;
  substituteTeacherUserId: string;
  status: LearningTeacherCoverageStatus;
  notes: string | null;
  assignedBy: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningTeacherLeaveRequestInput {
  organizationId: string;
  startDate: string;
  endDate: string;
  leaveType: LearningTeacherLeaveType;
  reason: string;
}

export interface AssignLearningTeacherSubstituteInput {
  leaveRequestId: string;
  timetableEntryId: string;
  coverageDate: string;
  substituteTeacherUserId: string;
  notes?: string | null;
}

export interface ReviewLearningTeacherLeaveInput {
  requestId: string;
  decision: "approved" | "rejected";
  reviewNote?: string | null;
}
