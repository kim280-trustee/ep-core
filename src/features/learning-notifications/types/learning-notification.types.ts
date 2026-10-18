export type LearningNotificationType =
  | "marketplace.booking_requested"
  | "marketplace.booking_confirmed"
  | "marketplace.booking_declined"
  | "marketplace.booking_cancelled";

export interface LearningNotification {
  id: string;
  organization_id: string;
  notification_type: LearningNotificationType;
  title: string;
  body: string;
  resource_type: "marketplace_booking";
  resource_id: string;
  read_at: string | null;
  created_at: string;
}
