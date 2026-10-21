import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type { CreateLearningTimetableEntry, LearningTimetableEntry } from "../types/learning-timetable.types";

type Row = Database["public"]["Tables"]["learning_timetable_entries"]["Row"];

function mapRow(row: Row): LearningTimetableEntry {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    organizationId: row.organization_id,
    classGroupId: row.class_group_id,
    subjectId: row.subject_id,
    teacherUserId: row.teacher_user_id,
    dayOfWeek: row.day_of_week,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    room: row.room,
    notes: row.notes,
    status: row.status as LearningTimetableEntry["status"],
    createdBy: row.created_by,
  };
}

export const learningTimetableRepository = {
  async list(organizationId: string): Promise<LearningTimetableEntry[]> {
    const { data, error } = await supabase
      .from("learning_timetable_entries")
      .select("*")
      .eq("organization_id", organizationId)
      .order("day_of_week", { ascending: true })
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async create(values: CreateLearningTimetableEntry): Promise<LearningTimetableEntry> {
    const { data, error } = await supabase
      .from("learning_timetable_entries")
      .insert({
        tenant_id: values.tenantId,
        organization_id: values.organizationId,
        class_group_id: values.classGroupId,
        subject_id: values.subjectId,
        teacher_user_id: values.teacherUserId,
        day_of_week: values.dayOfWeek,
        starts_at: values.startsAt,
        ends_at: values.endsAt,
        room: values.room,
        notes: values.notes,
        created_by: values.createdBy,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async setStatus(id: string, status: LearningTimetableEntry["status"]): Promise<void> {
    const { error } = await supabase
      .from("learning_timetable_entries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("learning_timetable_entries")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
