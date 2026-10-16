import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningAttendanceRegister,
  LearningAttendanceStatus,
  SaveLearningAttendanceInput,
} from "../types/learning-attendance.types";

export const learningAttendanceRepository = {
  async getHistory(organizationId: string, classGroupId: string, startDate: string, endDate: string): Promise<import("../types/learning-attendance.types").LearningAttendanceHistoryRow[]> {
    if (startDate > endDate) throw new Error("Start date must be on or before end date.");
    const { data: sessions, error: sessionsError } = await supabase
      .from("learning_attendance_sessions")
      .select("id,attendance_date")
      .eq("organization_id", organizationId)
      .eq("class_group_id", classGroupId)
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate)
      .order("attendance_date", { ascending: false })
      .limit(366);
    if (sessionsError) throw sessionsError;
    const counts = new Map<string, { present: number; absent: number; late: number; excused: number; marked: number }>();
    for (const session of sessions ?? []) counts.set(session.attendance_date, { present: 0, absent: 0, late: 0, excused: 0, marked: 0 });
    const sessionIds = (sessions ?? []).map((session) => session.id);
    if (sessionIds.length) {
      const { data: records, error: recordsError } = await supabase
        .from("learning_attendance_records")
        .select("attendance_session_id,attendance_status")
        .eq("organization_id", organizationId)
        .in("attendance_session_id", sessionIds);
      if (recordsError) throw recordsError;
      const dateBySessionId = new Map((sessions ?? []).map((session) => [session.id, session.attendance_date]));
      for (const record of records ?? []) {
        const date = dateBySessionId.get(record.attendance_session_id);
        const row = date ? counts.get(date) : undefined;
        if (!row) continue;
        if (record.attendance_status === "present" || record.attendance_status === "absent" || record.attendance_status === "late" || record.attendance_status === "excused") {
          row[record.attendance_status] += 1;
          row.marked += 1;
        }
      }
    }
    return [...counts.entries()].map(([date, row]) => ({ date, ...row }));
  },
  async getOrganizationHistory(organizationId: string, startDate: string, endDate: string): Promise<import("../types/learning-attendance.types").LearningOrganizationAttendanceHistoryRow[]> {
    if (startDate > endDate) throw new Error("Start date must be on or before end date.");
    const { data: sessions, error: sessionsError } = await supabase
      .from("learning_attendance_sessions")
      .select("id,attendance_date,class_group_id")
      .eq("organization_id", organizationId)
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate)
      .order("attendance_date", { ascending: false })
      .limit(5000);
    if (sessionsError) throw sessionsError;
    const counts = new Map<string, { classGroupId: string; date: string; present: number; absent: number; late: number; excused: number; marked: number }>();
    for (const session of sessions ?? []) {
      const key = session.class_group_id + ":" + session.attendance_date;
      counts.set(key, { classGroupId: session.class_group_id, date: session.attendance_date, present: 0, absent: 0, late: 0, excused: 0, marked: 0 });
    }
    const sessionIds = (sessions ?? []).map((session) => session.id);
    if (sessionIds.length) {
      const keyBySessionId = new Map((sessions ?? []).map((session) => [session.id, session.class_group_id + ":" + session.attendance_date]));
      for (let offset = 0; offset < sessionIds.length; offset += 100) {
        const batch = sessionIds.slice(offset, offset + 100);
        const { data: records, error: recordsError } = await supabase
          .from("learning_attendance_records")
          .select("attendance_session_id,attendance_status")
          .eq("organization_id", organizationId)
          .in("attendance_session_id", batch);
        if (recordsError) throw recordsError;
        for (const record of records ?? []) {
          const key = keyBySessionId.get(record.attendance_session_id);
          const row = key ? counts.get(key) : undefined;
          if (!row) continue;
          if (record.attendance_status === "present" || record.attendance_status === "absent" || record.attendance_status === "late" || record.attendance_status === "excused") {
            row[record.attendance_status] += 1;
            row.marked += 1;
          }
        }
      }
    }
    return [...counts.values()].sort((a, b) => b.date.localeCompare(a.date) || a.classGroupId.localeCompare(b.classGroupId));
  },
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
