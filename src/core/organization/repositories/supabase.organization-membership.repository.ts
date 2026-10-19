/**
 * Supabase Organization Membership Repository
 */

import { supabase } from "@/core/infrastructure/supabase/client";
import type { Database } from "@/core/database/database.types";
import type { OrganizationMembership } from "../types/organization-membership.types";
import type { OrganizationMembershipRepository } from "./organization-membership.repository";

type MembershipRow = Database["public"]["Tables"]["organization_memberships"]["Row"];
type MembershipUpdate = Database["public"]["Tables"]["organization_memberships"]["Update"];

function fromRow(row: MembershipRow): OrganizationMembership {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    organizationId: row.organization_id,
    userId: row.user_id,
    roleId: row.role_id,
    status: row.status as OrganizationMembership["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseOrganizationMembershipRepository implements OrganizationMembershipRepository {
  async findAllByOrganization(organizationId: string): Promise<OrganizationMembership[]> {
    const { data, error } = await supabase
      .from("organization_memberships")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(row => fromRow(row));
  }

  async findAllByUser(userId: string): Promise<OrganizationMembership[]> {
    const { data, error } = await supabase
      .from("organization_memberships")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(row => fromRow(row));
  }

  async findById(id: string): Promise<OrganizationMembership | undefined> {
    const { data, error } = await supabase
      .from("organization_memberships")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : undefined;
  }

  async create(membership: OrganizationMembership): Promise<OrganizationMembership> {
    const { data, error } = await supabase
      .from("organization_memberships")
      .insert({
        id: membership.id,
        tenant_id: membership.tenantId,
        organization_id: membership.organizationId,
        user_id: membership.userId,
        role_id: membership.roleId,
        status: membership.status,
        created_at: membership.createdAt,
        updated_at: membership.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw error;
    return fromRow(data);
  }

  async update(id: string, updates: Partial<OrganizationMembership>): Promise<OrganizationMembership | undefined> {
    const updateData: MembershipUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (updates.organizationId !== undefined) updateData.organization_id = updates.organizationId;
    if (updates.userId !== undefined) updateData.user_id = updates.userId;
    if (updates.roleId !== undefined) updateData.role_id = updates.roleId;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from("organization_memberships")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : undefined;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("organization_memberships").delete().eq("id", id);
    if (error) throw error;
  }
}

export const supabaseOrganizationMembershipRepository = new SupabaseOrganizationMembershipRepository();
