import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningAttendanceRegister,
  LearningAttendanceStatus,
  SaveLearningAttendanceInput,
} from "../types/learning-attendance.types";

export const learningAttendanceRepository = {
  async getRegister(organizationId: string, classGroupId: string, attendanceDate: string): Promise<LearningAttendanceRegister> {
    const { data: session, error: sessionError } = await supabase
      .from("learning_attendance_sessions")
      .select("id,status")
      .eq("organization_id", organizationId)
      .eq("class_group_id", classGroupId)
      .eq("attendance_date", attendanceDate)
      .maybeSingle();
    if (sessionError) throw sessionError;

    const statusByStudentId: Record<string, LearningAttendanceStatus> = {};
    const noteByStudentId: Record<string, string> = {};
    if (session?.id) {
      const { data: records, error: recordsError } = await supabase
        .from("learning_attendance_records")
        .select("student_user_id,attendance_status,note")
        .eq("organization_id", organizationId)
        .eq("attendance_session_id", session.id);
      if (recordsError) throw recordsError;
      for (const record of records ?? []) {
        statusByStudentId[record.student_user_id] = record.attendance_status as LearningAttendanceStatus;
        noteByStudentId[record.student_user_id] = record.note ?? "";
      }
    }
    return { sessionId: session?.id ?? null, date: attendanceDate, statusByStudentId, noteByStudentId };
  },

  async saveRegister(input: SaveLearningAttendanceInput): Promise<void> {
    const now = new Date().toISOString();
    const { data: session, error: sessionError } = await supabase
      .from("learning_attendance_sessions")
      .upsert({
        tenant_id: input.tenantId,
        organization_id: input.organizationId,
        class_group_id: input.classGroupId,
        attendance_date: input.attendanceDate,
        taken_by: input.takenBy,
        status: "open",
        updated_at: now,
      }, { onConflict: "class_group_id,attendance_date" })
      .select("id")
      .single();
    if (sessionError) throw sessionError;

    for (const record of input.records) {
      if (record.status === "unmarked") {
        const { error } = await supabase
          .from("learning_attendance_records")
          .delete()
          .eq("organization_id", input.organizationId)
          .eq("attendance_session_id", session.id)
          .eq("student_user_id", record.studentUserId);
        if (error) throw error;
        continue;
      }

      const { error } = await supabase
        .from("learning_attendance_records")
        .upsert({
          tenant_id: input.tenantId,
          organization_id: input.organizationId,
          attendance_session_id: session.id,
          student_user_id: record.studentUserId,
          attendance_status: record.status,
          note: record.note.trim() || null,
          marked_by: input.takenBy,
          marked_at: now,
          updated_at: now,
        }, { onConflict: "attendance_session_id,student_user_id" });
      if (error) throw error;
    }
  },
};
