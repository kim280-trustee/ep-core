import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningCalendarEvent, LearningCalendarEventType, LearningCalendarOrganization } from "../types/learning-school-calendar.types";

type RpcResult = { data: unknown; error: { message: string } | null };
type RawOrganization = { id: string; name: string; code: string; timezone: string; tenant_id: string };
type RawEvent = {
  id: string; organization_id: string; organization_name?: string;
  academic_year_id?: string | null; academic_year_name?: string | null;
  term_id?: string | null; term_name?: string | null;
  class_group_id: string | null; class_name?: string | null;
  event_type: LearningCalendarEventType; title: string; description: string;
  start_date: string; end_date: string; is_all_day: boolean;
  start_time: string | null; end_time: string | null;
  status?: LearningCalendarEvent["status"]; created_at?: string; published_at: string | null;
};
const client = supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult> };

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}
function asRows<T>(data: unknown): T[] { return Array.isArray(data) ? data as T[] : []; }
function mapEvent(row: RawEvent): LearningCalendarEvent {
  return {
    id: row.id, organizationId: row.organization_id, organizationName: row.organization_name,
    academicYearId: row.academic_year_id ?? null, academicYearName: row.academic_year_name ?? null,
    termId: row.term_id ?? null, termName: row.term_name ?? null,
    classGroupId: row.class_group_id, className: row.class_name ?? null,
    eventType: row.event_type, title: row.title, description: row.description,
    startDate: row.start_date, endDate: row.end_date, isAllDay: row.is_all_day,
    startTime: row.start_time, endTime: row.end_time, status: row.status,
    createdAt: row.created_at, publishedAt: row.published_at,
  };
}

export const learningSchoolCalendarRepository = {
  async listManageableOrganizations(): Promise<LearningCalendarOrganization[]> {
    const data = await rpc<unknown>("list_manageable_learning_calendar_organizations", {});
    return asRows<RawOrganization>(data).map((row) => ({
      id: row.id, name: row.name, code: row.code, timezone: row.timezone, tenantId: row.tenant_id,
    }));
  },
  async listManageableEvents(organizationId: string, startDate: string, endDate: string): Promise<LearningCalendarEvent[]> {
    const data = await rpc<unknown>("list_manageable_learning_calendar_events", {
      p_organization_id: organizationId, p_start_date: startDate, p_end_date: endDate,
    });
    return asRows<RawEvent>(data).map(mapEvent);
  },
  async listVisibleEvents(startDate: string, endDate: string): Promise<LearningCalendarEvent[]> {
    const data = await rpc<unknown>("list_learning_school_calendar_events", {
      p_start_date: startDate, p_end_date: endDate,
    });
    return asRows<RawEvent>(data).map(mapEvent);
  },
  async createDraft(input: {
    organizationId: string; academicYearId?: string; termId?: string; classGroupId?: string;
    eventType: LearningCalendarEventType; title: string; description: string;
    startDate: string; endDate: string; isAllDay: boolean; startTime?: string; endTime?: string;
  }): Promise<string> {
    const id = await rpc<unknown>("create_learning_school_calendar_event", {
      p_organization_id: input.organizationId,
      p_academic_year_id: input.academicYearId || null,
      p_term_id: input.termId || null,
      p_class_group_id: input.classGroupId || null,
      p_event_type: input.eventType,
      p_title: input.title,
      p_description: input.description,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_is_all_day: input.isAllDay,
      p_start_time: input.isAllDay ? null : input.startTime || null,
      p_end_time: input.isAllDay ? null : input.endTime || null,
    });
    if (typeof id !== "string" || !id) throw new Error("Calendar event was not saved.");
    return id;
  },
  async publish(eventId: string): Promise<boolean> {
    return rpc<boolean>("publish_learning_school_calendar_event", { p_event_id: eventId });
  },
};
