import { supabase } from "@/core/infrastructure/supabase/client";
import type { Category } from "../types/category.types";

export interface ICategoryRepository {
  findAll(tenantId: string, storeId: string): Promise<Category[]>;
  findById(tenantId: string, id: string): Promise<Category | null>;
  create(category: Category): Promise<Category>;
  update(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Category>
  ): Promise<Category>;
  delete(tenantId: string, storeId: string, id: string): Promise<void>;
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    storeId: row.store_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    parentId: (row.parent_id as string | null) ?? null,
    status: row.status as Category["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const categoryRepository: ICategoryRepository = {
  async findAll(tenantId, storeId) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .order("name");

    if (error) throw error;
    return (data ?? []).map(mapCategory);
  },

  async findById(tenantId, id) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCategory(data) : null;
  },

  async create(category) {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        id: category.id,
        tenant_id: category.tenantId,
        store_id: category.storeId,
        name: category.name,
        description: category.description,
        parent_id: category.parentId,
        status: category.status,
        created_at: category.createdAt,
        updated_at: category.updatedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCategory(data);
  },

  async update(tenantId, storeId, id, updates) {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.parentId !== undefined) payload.parent_id = updates.parentId;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapCategory(data);
  },

  async delete(tenantId, storeId, id) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .eq("id", id);

    if (error) throw error;
  },
};
