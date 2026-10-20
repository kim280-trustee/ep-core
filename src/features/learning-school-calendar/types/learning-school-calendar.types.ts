export type LearningCalendarEventType = "school_event" | "holiday" | "examination" | "assessment_deadline";
export type LearningCalendarEventStatus = "draft" | "published" | "cancelled";

export interface LearningCalendarOrganization {
  id: string;
  name: string;
  code: string;
  timezone: string;
  tenantId: string;
}

export interface LearningCalendarEvent {
  id: string;
  organizationId: string;
  organizationName?: string;
  academicYearId: string | null;
  academicYearName: string | null;
  termId: string | null;
  termName: string | null;
  classGroupId: string | null;
  className: string | null;
  eventType: LearningCalendarEventType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  startTime: string | null;
  endTime: string | null;
  status?: LearningCalendarEventStatus;
  createdAt?: string;
  publishedAt: string | null;
}
