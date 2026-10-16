import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type { Organization } from "@/core/organization/types/organization.types";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type UserRow = Pick<Database["public"]["Tables"]["users"]["Row"], "id" | "name" | "email">;

export interface SchoolAdminUser {
  id: string;
  name: string;
  email: string;
}

function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    code: row.code,
    country: row.country,
    currency: row.currency,
    timezone: row.timezone,
    status: row.status as Organization["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUser(row: UserRow): SchoolAdminUser {
  return { id: row.id, name: row.name ?? "Unnamed user", email: row.email ?? "" };
}

export const learningSchoolAdminRepository = {
  async listManageableOrganizations(userId: string): Promise<Organization[]> {
    const { data: memberships, error: membershipError } = await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("status", "active");
    if (membershipError) throw membershipError;

    const organizationIds = [...new Set((memberships ?? []).map((item) => item.organization_id))];
    if (!organizationIds.length) return [];

    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .in("id", organizationIds)
      .eq("status", "active")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapOrganization);
  },

  async listEligibleUsers(organizationId: string, tenantId: string): Promise<SchoolAdminUser[]> {
    const { data: memberships, error: membershipError } = await supabase
      .from("organization_memberships")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("status", "active");
    if (membershipError) throw membershipError;

    const userIds = [...new Set((memberships ?? []).map((item) => item.user_id))];
    if (!userIds.length) return [];

    const { data, error } = await supabase
      .from("users")
      .select("id,name,email")
      .eq("tenant_id", tenantId)
      .in("id", userIds)
      .order("name", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as UserRow[]).map(mapUser);
  },,
  async listStaff(organizationId: string) {
    const { data: memberships, error } = await supabase.from("organization_memberships").select("id,tenant_id,user_id,role_id,status").eq("organization_id", organizationId);
    if (error) throw error;
    if (!memberships?.length) return [];
    const tenantId = memberships[0].tenant_id;
    const { data: roles, error: roleError } = await supabase.from("roles").select("id,name").eq("tenant_id", tenantId).ilike("name", "STAFF");
    if (roleError) throw roleError;
    const roleIds = new Set((roles ?? []).map((role) => role.id));
    const staff = memberships.filter((item) => item.role_id && roleIds.has(item.role_id));
    if (!staff.length) return [];
    const ids = [...new Set(staff.map((item) => item.user_id))];
    const { data: users, error: userError } = await supabase.from("users").select("id,name,email").eq("tenant_id", tenantId).in("id", ids);
    if (userError) throw userError;
    const byId = new Map(((users ?? []) as UserRow[]).map((item) => [item.id, item]));
    return staff.map((item) => ({ membershipId: item.id, userId: item.user_id, name: byId.get(item.user_id)?.name ?? "Unnamed user", email: byId.get(item.user_id)?.email ?? "", status: item.status }));
  },
};
