import {
  supabase,
} from "@/core/infrastructure/supabase/client";

import type {
  Supplier,
} from "../types/supplier.types";

import type {
  ISupplierRepository,
} from "./supplier.repository";


interface SupplierDatabaseRow {

  id: string;

  tenant_id: string;

  store_id: string;

  name: string;

  contact_person: string | null;

  phone: string | null;

  email: string | null;

  address: string | null;

  tax_id: string | null;

  payment_terms: string | null;

  status: string;

  created_at: string;

  updated_at: string;

}


function fromDatabaseRow(
  row: SupplierDatabaseRow,
): Supplier {

  return {

    id: row.id,

    tenantId: row.tenant_id,

    storeId: row.store_id,

    name: row.name,

    contactPerson: row.contact_person,

    phone: row.phone,

    email: row.email,

    address: row.address,

    taxId: row.tax_id,

    paymentTerms: row.payment_terms,

    status: row.status as Supplier["status"],

    createdAt: row.created_at,

    updatedAt: row.updated_at,

  };

}


class SupabaseSupplierRepository
implements ISupplierRepository {


  async findAll(
    tenantId: string,
    storeId?: string,
  ): Promise<Supplier[]> {

    let query =
      supabase
        .from("suppliers")
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        );


    if (storeId) {

      query =
        query.eq(
          "store_id",
          storeId,
        );

    }


    const {
      data,
      error,
    } =
      await query.order(
        "created_at",
        {
          ascending: false,
        },
      );


    if (error) {

      throw error;

    }


    return (
      (data ?? []) as SupplierDatabaseRow[]
    ).map(
      fromDatabaseRow,
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<Supplier | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("suppliers")
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
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
      data as SupplierDatabaseRow,
    );

  }


  async create(
    supplier: Supplier,
  ): Promise<Supplier> {

    const {
      data,
      error,
    } =
      await supabase
        .from("suppliers")
        .insert({

          id: supplier.id,

          tenant_id: supplier.tenantId,

          store_id: supplier.storeId,

          name: supplier.name,

          contact_person:
            supplier.contactPerson,

          phone: supplier.phone,

          email: supplier.email,

          address: supplier.address,

          tax_id: supplier.taxId,

          payment_terms:
            supplier.paymentTerms,

          status: supplier.status,

          created_at:
            supplier.createdAt,

          updated_at:
            supplier.updatedAt,

        })
        .select("*")
        .single();


    if (error) {

      throw error;

    }


    return fromDatabaseRow(
      data as SupplierDatabaseRow,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<Supplier>,
  ): Promise<Supplier | undefined> {

    const updateData:
      Record<string, unknown> = {};


    if (updates.name !== undefined) {

      updateData.name =
        updates.name;

    }

    if (
      updates.contactPerson !== undefined
    ) {

      updateData.contact_person =
        updates.contactPerson;

    }

    if (updates.phone !== undefined) {

      updateData.phone =
        updates.phone;

    }

    if (updates.email !== undefined) {

      updateData.email =
        updates.email;

    }

    if (updates.address !== undefined) {

      updateData.address =
        updates.address;

    }

    if (updates.taxId !== undefined) {

      updateData.tax_id =
        updates.taxId;

    }

    if (
      updates.paymentTerms !== undefined
    ) {

      updateData.payment_terms =
        updates.paymentTerms;

    }

    if (updates.status !== undefined) {

      updateData.status =
        updates.status;

    }


    updateData.updated_at =
      new Date().toISOString();


    const {
      data,
      error,
    } =
      await supabase
        .from("suppliers")
        .update(updateData)
        .eq(
          "tenant_id",
          tenantId,
        )
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
      data as SupplierDatabaseRow,
    );

  }


  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {

    const {
      data,
      error,
    } =
      await supabase
        .from("suppliers")
        .delete()
        .eq(
          "tenant_id",
          tenantId,
        )
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


export const supabaseSupplierRepository =
  new SupabaseSupplierRepository();
