export type LearningTimetableStatus = "active" | "cancelled";

export interface LearningTimetableEntry {
  id: string;
  tenantId: string;
  organizationId: string;
  classGroupId: string;
  subjectId: string;
  teacherUserId: string | null;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  room: string | null;
  notes: string | null;
  status: LearningTimetableStatus;
  createdBy: string;
}

export interface CreateLearningTimetableEntry {
  tenantId: string;
  organizationId: string;
  classGroupId: string;
  subjectId: string;
  teacherUserId: string | null;
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  room: string | null;
  notes: string | null;
  createdBy: string;
}
