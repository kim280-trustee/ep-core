import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  BookingRequest,
  EligibleStudent,
  Offering,
  PublicAvailabilitySlot,
  TeacherAvailabilitySlot,
  TeacherOffering,
  TeacherOrganization,
  TeacherProfile,
  PublicTeacherProfile,
  TeacherProfileForReview,
} from "../types/learning-marketplace.types";

type RpcResult = { data: unknown; error: { message: string } | null };
const client = supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<RpcResult> };
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}
function rows<T>(data: unknown): T[] { return Array.isArray(data) ? data as T[] : []; }

export const learningMarketplaceRepository = {
  async listTeacherOrganizations(): Promise<TeacherOrganization[]> { return rows(await rpc<unknown>("list_learning_marketplace_teacher_organizations", {})); },
  async listOfferings(): Promise<Offering[]> { return rows(await rpc<unknown>("list_learning_marketplace_offerings", {})); },
  async listTeacherOfferings(): Promise<TeacherOffering[]> { return rows(await rpc<unknown>("list_learning_marketplace_teacher_offerings", {})); },
  async listEligibleStudents(): Promise<EligibleStudent[]> { return rows(await rpc<unknown>("list_learning_marketplace_eligible_students", {})); },
  async listBookingRequests(): Promise<BookingRequest[]> { return rows(await rpc<unknown>("list_learning_marketplace_booking_requests", {})); },
  async listTeacherAvailability(): Promise<TeacherAvailabilitySlot[]> { return rows(await rpc<unknown>("list_learning_marketplace_teacher_availability", {})); },
  async listPublicAvailability(): Promise<PublicAvailabilitySlot[]> { return rows(await rpc<unknown>("list_learning_marketplace_public_availability", {})); },
  async saveAvailabilitySlot(input: { slotId?: string | null; organizationId: string; weekday: number; startTime: string; endTime: string; timezoneName: string; active: boolean }): Promise<string> {
    return rpc("save_learning_marketplace_teacher_availability", {
      p_slot_id: input.slotId ?? null,
      p_organization_id: input.organizationId,
      p_weekday: input.weekday,
      p_start_time: input.startTime,
      p_end_time: input.endTime,
      p_timezone_name: input.timezoneName,
      p_active: input.active,
    });
  },
  async deleteAvailabilitySlot(slotId: string): Promise<string> {
    return rpc("delete_learning_marketplace_teacher_availability", { p_slot_id: slotId });
  },
  async saveOffering(input: { offeringId?: string | null; organizationId: string; title: string; subject: string; description: string; deliveryMode: string; lessonType: string; durationMinutes: number; priceAmount: number; currencyCode: string; packageLessons: number; gradeLevels: string[]; status: string }): Promise<string> {
    return rpc("save_learning_marketplace_offering", {
      p_offering_id: input.offeringId ?? null, p_organization_id: input.organizationId,
      p_title: input.title, p_subject: input.subject, p_description: input.description,
      p_delivery_mode: input.deliveryMode, p_lesson_type: input.lessonType,
      p_duration_minutes: input.durationMinutes, p_price_amount: input.priceAmount,
      p_currency_code: input.currencyCode, p_package_lessons: input.packageLessons,
      p_grade_levels: input.gradeLevels, p_status: input.status,
    });
  },
  async createBookingRequest(input: { offeringId: string; studentUserId: string; message: string; preferredDate: string | null; preferredTime: string | null }): Promise<string> {
    return rpc("create_learning_marketplace_booking_request", {
      p_offering_id: input.offeringId, p_student_user_id: input.studentUserId,
      p_message: input.message, p_preferred_date: input.preferredDate, p_preferred_time: input.preferredTime,
    });
  },
  async respondToRequest(input: { requestId: string; status: "accepted" | "declined"; responseNote: string }): Promise<string> {
    return rpc("respond_learning_marketplace_booking_request", { p_request_id: input.requestId, p_status: input.status, p_response_note: input.responseNote });
  },
  async listTeacherProfiles(): Promise<TeacherProfile[]> { return rows(await rpc<unknown>("list_learning_marketplace_teacher_profiles", {})); },
  async listPublicTeacherProfiles(): Promise<PublicTeacherProfile[]> { return rows(await rpc<unknown>("list_learning_marketplace_public_teacher_profiles", {})); },
  async listProfilesForReview(): Promise<TeacherProfileForReview[]> { return rows(await rpc<unknown>("list_learning_marketplace_profiles_for_review", {})); },
  async saveTeacherProfile(input: { organizationId: string; headline: string; bio: string; languages: string[]; credentials: string[]; experienceYears: number }): Promise<string> {
    return rpc("save_learning_marketplace_teacher_profile", {
      p_organization_id: input.organizationId,
      p_headline: input.headline,
      p_bio: input.bio,
      p_languages: input.languages,
      p_credentials: input.credentials,
      p_experience_years: input.experienceYears,
    });
  },
  async reviewTeacherProfile(input: { profileId: string; status: "verified" | "rejected"; reviewNote: string }): Promise<string> {
    return rpc("review_learning_marketplace_teacher_profile", {
      p_profile_id: input.profileId,
      p_status: input.status,
      p_review_note: input.reviewNote,
    });
  },
};
