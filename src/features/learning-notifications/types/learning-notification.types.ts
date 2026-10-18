export type LearningNotificationType =
  | "marketplace.booking_requested"
  | "marketplace.booking_confirmed"
  | "marketplace.booking_declined"
  | "marketplace.booking_cancelled"
  | "marketplace.safety_reported"
  | "learning.assignment_published"
  | "learning.assessment_result_available"
  | "learning.parent_assignment_published"
  | "learning.parent_assessment_result_available"
  | "school.parent_attendance_recorded"
  | "school.student_invitation_accepted";

export interface LearningNotification {
  id: string;
  organization_id: string;
  notification_type: LearningNotificationType;
  title: string;
  body: string;
  resource_type: "marketplace_booking" | "learning_assignment" | "assessment_result" | "attendance_session" | "student_invitation";
  resource_id: string;
  read_at: string | null;
  created_at: string;
}


export type LearningNotificationPreferenceType = Exclude<
  LearningNotificationType,
  "marketplace.safety_reported"
>;

export interface LearningNotificationPreference {
  notification_type: LearningNotificationPreferenceType;
  in_app_enabled: boolean;
}
