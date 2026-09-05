import { supabase } from "@/core/infrastructure/supabase/client";
import type { Unit } from "../types/unit.types";

export interface IUnitRepository {
  findAll(tenantId: string, storeId: string): Promise<Unit[]>;
  findById(tenantId: string, id: string): Promise<Unit | null>;
  create(unit: Unit): Promise<Unit>;
  update(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Unit>
  ): Promise<Unit>;
  delete(tenantId: string, storeId: string, id: string): Promise<void>;
}

function mapUnit(row: Record<string, unknown>): Unit {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    storeId: row.store_id as string,
    name: row.name as string,
    symbol: row.symbol as string,
    description: (row.description as string | null) ?? null,
    status: row.status as Unit["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const unitRepository: IUnitRepository = {
  async findAll(tenantId, storeId) {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .order("name");

    if (error) throw error;
    return (data ?? []).map(mapUnit);
  },

  async findById(tenantId, id) {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapUnit(data) : null;
  },

  async create(unit) {
    const { data, error } = await supabase
      .from("units")
      .insert({
        id: unit.id,
        tenant_id: unit.tenantId,
        store_id: unit.storeId,
        name: unit.name,
        symbol: unit.symbol,
        description: unit.description,
        status: unit.status,
        created_at: unit.createdAt,
        updated_at: unit.updatedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return mapUnit(data);
  },

  async update(tenantId, storeId, id, updates) {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.symbol !== undefined) payload.symbol = updates.symbol;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from("units")
      .update(payload)
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapUnit(data);
  },

  async delete(tenantId, storeId, id) {
    const { error } = await supabase
      .from("units")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId)
      .eq("id", id);

    if (error) throw error;
  },
};
