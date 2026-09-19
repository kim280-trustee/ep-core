/**
 * Supabase Organization Repository
 */

import { supabase } from "@/core/infrastructure/supabase/client";
import type { Database } from "@/core/database/database.types";
import type { Organization } from "../types/organization.types";
import type { OrganizationRepository } from "./organization.repository";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationUpdate = Database["public"]["Tables"]["organizations"]["Update"];

function fromRow(row: OrganizationRow): Organization {
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

export class SupabaseOrganizationRepository implements OrganizationRepository {
  async findAll(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(row => fromRow(row));
  }

  async findById(id: string): Promise<Organization | undefined> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : undefined;
  }

  async create(organization: Organization): Promise<Organization> {
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        id: organization.id,
        tenant_id: organization.tenantId,
        name: organization.name,
        code: organization.code,
        country: organization.country,
        currency: organization.currency,
        timezone: organization.timezone,
        status: organization.status,
        created_at: organization.createdAt,
        updated_at: organization.updatedAt,
      })
      .select("*")
      .single();
    if (error) throw error;
    return fromRow(data);
  }

  async update(id: string, updates: Partial<Organization>): Promise<Organization | undefined> {
    const updateData: OrganizationUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.code !== undefined) updateData.code = updates.code;
    if (updates.country !== undefined) updateData.country = updates.country;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : undefined;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) throw error;
  }
}

export const supabaseOrganizationRepository = new SupabaseOrganizationRepository();
