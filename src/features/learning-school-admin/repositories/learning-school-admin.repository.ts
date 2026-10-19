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
    // A global permission check alone must not make every active membership
    // manageable. Keep the organisation list scoped to memberships whose
    // organisation role is OWNER or MANAGER, then let the page's permission
    // gate and database RLS enforce the remaining access rules.
    const { data: memberships, error: membershipError } = await supabase
      .from("organization_memberships")
      .select("organization_id, roles!organization_memberships_role_fk(name)")
      .eq("user_id", userId)
      .eq("status", "active");
    if (membershipError) throw membershipError;

    const organizationIds = [...new Set(
      (memberships ?? [])
        .filter((item) => {
          const roleName = item.roles?.name?.trim().toUpperCase();
          return roleName === "OWNER" || roleName === "MANAGER";
        })
        .map((item) => item.organization_id),
    )];
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
  },
};
