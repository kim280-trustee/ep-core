import { supabase } from "@/core/infrastructure/supabase/client";
import type { SupplierPayment } from "../types/supplier-payment.types";
import type { SupplierPaymentRepository } from "./supplier-payment.repository";

interface DatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string;
  supplier_id: string;
  payment_number: string;
  amount: number | string;
  method: SupplierPayment["method"];
  reference: string | null;
  notes: string | null;
  status: SupplierPayment["status"];
  paid_at: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: DatabaseRow): SupplierPayment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    storeId: row.store_id,
    supplierId: row.supplier_id,
    paymentNumber: row.payment_number,
    amount: Number(row.amount),
    method: row.method,
    reference: row.reference,
    notes: row.notes,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class SupabaseSupplierPaymentRepository
  implements SupplierPaymentRepository {
  async findAll(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierPayment[]> {
    let query = supabase
      .from("supplier_payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId);

    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }

    const { data, error } = await query.order("paid_at", {
      ascending: false,
    });

    if (error) throw error;

    return (data ?? []).map((row) => fromRow(row as DatabaseRow));
  }

  async create(payment: SupplierPayment): Promise<SupplierPayment> {
    const { data, error } = await supabase
      .from("supplier_payments")
      .insert({
        id: payment.id,
        tenant_id: payment.tenantId,
        store_id: payment.storeId,
        supplier_id: payment.supplierId,
        payment_number: payment.paymentNumber,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        notes: payment.notes,
        status: payment.status,
        paid_at: payment.paidAt,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
      })
      .select("*")
      .single();

    if (error) throw error;

    return fromRow(data as DatabaseRow);
  }
}

export const supabaseSupplierPaymentRepository =
  new SupabaseSupplierPaymentRepository();
