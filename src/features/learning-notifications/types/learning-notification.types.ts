export type LearningNotificationType =
  | "marketplace.booking_requested"
  | "marketplace.booking_confirmed"
  | "marketplace.booking_declined"
  | "marketplace.booking_cancelled"
  | "marketplace.safety_reported"
  | "learning.assignment_published"
  | "learning.assessment_result_available";

export interface LearningNotification {
  id: string;
  organization_id: string;
  notification_type: LearningNotificationType;
  title: string;
  body: string;
  resource_type: "marketplace_booking" | "learning_assignment" | "assessment_result";
  resource_id: string;
  read_at: string | null;
  created_at: string;
}
