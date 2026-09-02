import { supabase } from "@/core/infrastructure/supabase/client";

import type { Payment } from "../types/payment.types";
import type { PaymentRepository } from "./payment.repository";

interface PaymentDatabaseRow {
  id: string;
  tenant_id: string;
  sales_order_id: string;
  method: string;
  amount: number | string;
  status: string;
  reference: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

function fromDatabaseRow(row: PaymentDatabaseRow): Payment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    salesOrderId: row.sales_order_id,
    method: row.method as Payment["method"],
    amount: Number(row.amount),
    status: row.status as Payment["status"],
    reference: row.reference ?? undefined,
    provider: row.provider ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class SupabasePaymentRepository implements PaymentRepository {
  async findAll(tenantId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as PaymentDatabaseRow[]).map(
      fromDatabaseRow,
    );
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    return fromDatabaseRow(data as PaymentDatabaseRow);
  }

  async findByOrderId(
    tenantId: string,
    salesOrderId: string,
  ): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("sales_order_id", salesOrderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as PaymentDatabaseRow[]).map(
      fromDatabaseRow,
    );
  }

  async create(payment: Payment): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        id: payment.id,
        tenant_id: payment.tenantId,
        sales_order_id: payment.salesOrderId,
        method: payment.method,
        amount: payment.amount,
        status: payment.status,
        reference: payment.reference ?? null,
        provider: payment.provider ?? null,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
      })
      .select("*")
      .single();

    if (error) throw error;

    return fromDatabaseRow(data as PaymentDatabaseRow);
  }

  async update(
    tenantId: string,
    id: string,
    updates: Partial<Payment>,
  ): Promise<Payment | undefined> {
    const updateData: Record<string, unknown> = {};

    if (updates.method !== undefined) {
      updateData.method = updates.method;
    }

    if (updates.provider !== undefined) {
      updateData.provider = updates.provider ?? null;
    }

    if (updates.amount !== undefined) {
      updateData.amount = updates.amount;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    if (updates.reference !== undefined) {
      updateData.reference = updates.reference ?? null;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    return fromDatabaseRow(data as PaymentDatabaseRow);
  }
}

export const supabasePaymentRepository =
  new SupabasePaymentRepository();




