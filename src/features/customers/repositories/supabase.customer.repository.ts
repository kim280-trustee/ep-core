import {
  supabase,
} from "@/core/infrastructure/supabase/client";

import type {
  Customer,
} from "../types/customer.types";

import type {
  ICustomerRepository,
} from "./customer.repository";


interface CustomerDatabaseRow {

  id: string;

  tenant_id: string;

  store_id: string;

  name: string;

  customer_type: string;

  phone: string | null;

  email: string | null;

  address: string | null;

  tax_number: string | null;

  credit_limit: number | null;

  status: string;

  created_at: string;

  updated_at: string;

}


function fromDatabaseRow(
  row: CustomerDatabaseRow,
): Customer {

  return {

    id: row.id,

    tenantId: row.tenant_id,

    storeId: row.store_id,

    name: row.name,

    customerType:
      row.customer_type as Customer["customerType"],

    phone: row.phone,

    email: row.email,

    address: row.address,

    taxNumber: row.tax_number,

    creditLimit: row.credit_limit,

    status:
      row.status as Customer["status"],

    createdAt: row.created_at,

    updatedAt: row.updated_at,

  };

}


class SupabaseCustomerRepository
  implements ICustomerRepository {


  async findAll(
    tenantId: string,
    storeId?: string,
  ): Promise<Customer[]> {

    let query =
      supabase
        .from("customers")
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
      (data ?? []) as CustomerDatabaseRow[]
    ).map(
      fromDatabaseRow,
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<Customer | undefined> {

    const {
      data,
      error,
    } =
      await supabase
        .from("customers")
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
      data as CustomerDatabaseRow,
    );

  }


  async create(
    customer: Customer,
  ): Promise<Customer> {

    const {
      data,
      error,
    } =
      await supabase
        .from("customers")
        .insert({

          id:
            customer.id,

          tenant_id:
            customer.tenantId,

          store_id:
            customer.storeId,

          name:
            customer.name,

          customer_type:
            customer.customerType,

          phone:
            customer.phone,

          email:
            customer.email,

          address:
            customer.address,

          tax_number:
            customer.taxNumber,

          credit_limit:
            customer.creditLimit,

          status:
            customer.status,

          created_at:
            customer.createdAt,

          updated_at:
            customer.updatedAt,

        })
        .select("*")
        .single();


    if (error) {

      throw error;

    }


    return fromDatabaseRow(
      data as CustomerDatabaseRow,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<Customer>,
  ): Promise<Customer | undefined> {

    const updateData:
      Record<string, unknown> = {};


    if (updates.name !== undefined) {

      updateData.name =
        updates.name;

    }

    if (
      updates.customerType !== undefined
    ) {

      updateData.customer_type =
        updates.customerType;

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

    if (
      updates.taxNumber !== undefined
    ) {

      updateData.tax_number =
        updates.taxNumber;

    }

    if (
      updates.creditLimit !== undefined
    ) {

      updateData.credit_limit =
        updates.creditLimit;

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
        .from("customers")
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
      data as CustomerDatabaseRow,
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
        .from("customers")
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


export const supabaseCustomerRepository =
  new SupabaseCustomerRepository();
