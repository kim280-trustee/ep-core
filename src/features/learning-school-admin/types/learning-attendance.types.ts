export type LearningAttendanceStatus = "unmarked" | "present" | "absent" | "late" | "excused";
export type PersistedLearningAttendanceStatus = Exclude<LearningAttendanceStatus, "unmarked">;

export interface LearningAttendanceRecord {
  studentUserId: string;
  status: PersistedLearningAttendanceStatus;
  note: string | null;
}

export interface LearningAttendanceRegister {
  sessionId: string | null;
  date: string;
  statusByStudentId: Record<string, LearningAttendanceStatus>;
  noteByStudentId: Record<string, string>;
}

export interface SaveLearningAttendanceInput {
  tenantId: string;
  organizationId: string;
  classGroupId: string;
  attendanceDate: string;
  takenBy: string;
  records: Array<{
    studentUserId: string;
    status: LearningAttendanceStatus;
    note: string;
  }>;
}

export interface LearningAttendanceHistoryRow {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  marked: number;
}

export interface LearningOrganizationAttendanceHistoryRow {
  classGroupId: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  marked: number;
}
