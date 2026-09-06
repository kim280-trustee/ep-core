import {
  supabase,
} from "@/core/infrastructure/supabase/client";

import type {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "../types/warehouse.types";

import type {
  WarehouseRepository,
} from "./warehouse.repository";

interface WarehouseDatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string;
  name: string;
  code: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone: string | null;
  manager_name: string | null;
  created_at: string;
  updated_at: string;
}

function fromDatabaseRow(
  row: WarehouseDatabaseRow,
): Warehouse {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    storeId: row.store_id,
    code: row.code,
    name: row.name,
    address: row.address,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone ?? undefined,
    managerName: row.manager_name ?? undefined,
    status: row.is_active
      ? "ACTIVE"
      : "INACTIVE",
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

class SupabaseWarehouseRepository
implements WarehouseRepository {

  async findAll(): Promise<Warehouse[]> {
    const {
      data,
      error,
    } = await supabase
      .from("warehouses")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw error;
    }

    return (
      (data ?? []) as WarehouseDatabaseRow[]
    ).map(
      fromDatabaseRow,
    );
  }

  async findById(
    id: string,
  ): Promise<Warehouse | undefined> {
    const {
      data,
      error,
    } = await supabase
      .from("warehouses")
      .select("*")
      .eq(
        "id",
        id,
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    return fromDatabaseRow(
      data as WarehouseDatabaseRow,
    );
  }

  async create(
    warehouse:
      CreateWarehouseDto & {
        tenantId: string;
        storeId: string;
      },
  ): Promise<Warehouse> {
    const {
      data,
      error,
    } = await supabase
      .from("warehouses")
      .insert({
        tenant_id:
          warehouse.tenantId,
        store_id:
          warehouse.storeId,
        name:
          warehouse.name,
        code:
          warehouse.code,
        address:
          warehouse.address,
        city:
          warehouse.city,
        province:
          warehouse.province,
        postal_code:
          warehouse.postalCode,
        country:
          warehouse.country,
        phone:
          warehouse.phone ?? null,
        manager_name:
          warehouse.managerName ?? null,
        description:
          null,
        is_default:
          false,
        is_active:
          true,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return fromDatabaseRow(
      data as WarehouseDatabaseRow,
    );
  }

  async update(
    id: string,
    warehouse: UpdateWarehouseDto,
  ): Promise<Warehouse | undefined> {
    const updateData:
      Record<string, unknown> = {};

    if (
      warehouse.name !== undefined
    ) {
      updateData.name =
        warehouse.name;
    }

    if (
      warehouse.code !== undefined
    ) {
      updateData.code =
        warehouse.code;
    }

    if (
      warehouse.address !== undefined
    ) {
      updateData.address =
        warehouse.address;
    }

    if (
      warehouse.city !== undefined
    ) {
      updateData.city =
        warehouse.city;
    }

    if (
      warehouse.province !== undefined
    ) {
      updateData.province =
        warehouse.province;
    }

    if (
      warehouse.postalCode !== undefined
    ) {
      updateData.postal_code =
        warehouse.postalCode;
    }

    if (
      warehouse.country !== undefined
    ) {
      updateData.country =
        warehouse.country;
    }

    if (
      warehouse.phone !== undefined
    ) {
      updateData.phone =
        warehouse.phone || null;
    }

    if (
      warehouse.managerName !== undefined
    ) {
      updateData.manager_name =
        warehouse.managerName || null;
    }

    if (
      Object.keys(updateData).length === 0
    ) {
      return this.findById(
        id,
      );
    }

    updateData.updated_at =
      new Date().toISOString();

    const {
      data,
      error,
    } = await supabase
      .from("warehouses")
      .update(updateData)
      .eq(
        "id",
        id,
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return undefined;
    }

    return fromDatabaseRow(
      data as WarehouseDatabaseRow,
    );
  }

  async delete(
    id: string,
  ): Promise<boolean> {
    const {
      data,
      error,
    } = await supabase
      .from("warehouses")
      .delete()
      .eq(
        "id",
        id,
      )
      .select("id");

    if (error) {
      throw error;
    }

    return (
      (data ?? []).length > 0
    );
  }
}

export const supabaseWarehouseRepository =
  new SupabaseWarehouseRepository();
