import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningClassMembership,
  LearningClassMembershipInput,
} from "../types/learning-enrollment.types";

type Row = Database["public"]["Tables"]["learning_class_memberships"]["Row"];

const map = (r: Row): LearningClassMembership => ({
  id: r.id,
  tenantId: r.tenant_id,
  organizationId: r.organization_id,
  classGroupId: r.class_group_id,
  userId: r.user_id,
  membershipType:
    r.membership_type as LearningClassMembership["membershipType"],
  status: r.status as LearningClassMembership["status"],
  joinedAt: r.joined_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

async function listActiveMemberships(userId: string) {
  const { data, error } = await supabase
    .from("learning_class_memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at");

  if (error) throw error;

  return data ?? [];
}

export const learningEnrollmentRepository = {
  async listClassMembers(classGroupId: string) {
    const { data, error } = await supabase
      .from("learning_class_memberships")
      .select("*")
      .eq("class_group_id", classGroupId)
      .eq("status", "active")
      .order("membership_type")
      .order("created_at");

    if (error) throw error;

    return (data ?? []).map(map);
  },

  async listUserClasses(userId: string) {
    let rows = await listActiveMemberships(userId);

    // Learning memberships use public.users.id, while some auth flows
    // may provide the Supabase Auth user id. Resolve that identifier
    // without changing the membership schema or bypassing RLS.
    if (!rows.length) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.id && profile.id !== userId) {
        rows = await listActiveMemberships(profile.id);
      }
    }

    return rows.map(map);
  },

  async addMember(input: LearningClassMembershipInput) {
    const { data, error } = await supabase
      .from("learning_class_memberships")
      .insert({
        tenant_id: input.tenantId,
        organization_id: input.organizationId,
        class_group_id: input.classGroupId,
        user_id: input.userId,
        membership_type: input.membershipType,
        status: input.status ?? "active",
        joined_at: input.joinedAt ?? new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    return map(data);
  },

  async updateMember(
    id: string,
    data: Partial<LearningClassMembershipInput>,
  ) {
    const { data: row, error } = await supabase
      .from("learning_class_memberships")
      .update({
        status: data.status,
        joined_at: data.joinedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return map(row);
  },

  async removeMember(id: string) {
    const { error } = await supabase
      .from("learning_class_memberships")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) throw error;
  },
};
