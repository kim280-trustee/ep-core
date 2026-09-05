import { supabase } from "@/core/infrastructure/supabase/client";
import type { Brand } from "../types/brand.types";

export interface IBrandRepository {
  findAll(tenantId: string, storeId: string): Promise<Brand[]>;
  findById(tenantId: string, id: string): Promise<Brand | null>;
  findByCode(
    tenantId: string,
    storeId: string,
    code: string
  ): Promise<Brand | null>;
  existsByCode(
    tenantId: string,
    storeId: string,
    code: string,
    excludeId?: string
  ): Promise<boolean>;
  create(brand: Brand): Promise<Brand>;
  update(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Brand>
  ): Promise<Brand>;
  delete(tenantId: string, storeId: string, id: string): Promise<void>;
}

function mapBrand(row: Record<string, unknown>): Brand {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    storeId: row.store_id as string,
    name: row.name as string,
    code: (row.code as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    logoUrl: (row.logo_url as string | null) ?? null,
    status: row.status as Brand["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const brandRepository: IBrandRepository = {
  async findAll(tenantId, storeId) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .order("name");

    if (error) throw error;
    return (data ?? []).map(mapBrand);
  },

  async findById(tenantId, id) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapBrand(data) : null;
  },

  async findByCode(tenantId, storeId, code) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .ilike("code", code)
      .maybeSingle();

    if (error) throw error;
    return data ? mapBrand(data) : null;
  },

  async existsByCode(tenantId, storeId, code, excludeId) {
    let query = supabase
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .ilike("code", code);

    if (excludeId) query = query.neq("id", excludeId);

    const { count, error } = await query;

    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async create(brand) {
    const { data, error } = await supabase
      .from("brands")
      .insert({
        id: brand.id,
        tenant_id: brand.tenantId,
        store_id: brand.storeId,
        name: brand.name,
        code: brand.code,
        description: brand.description,
        logo_url: brand.logoUrl,
        status: brand.status,
        created_at: brand.createdAt,
        updated_at: brand.updatedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return mapBrand(data);
  },

  async update(tenantId, storeId, id, updates) {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from("brands")
      .update(payload)
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapBrand(data);
  },

  async delete(tenantId, storeId, id) {
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .eq("id", id);

    if (error) throw error;
  },
};
