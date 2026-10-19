import { supabase } from "@/core/infrastructure/supabase/client";

import type { PaymentRefund } from "../types/payment-refund.types";
import type { PaymentRefundRepository } from "./payment-refund.repository";

interface PaymentRefundDatabaseRow {
  id: string;
  tenant_id: string;
  payment_id: string;
  sales_order_id: string;
  amount: number | string;
  created_at: string;
  reference: string | null;
}

function fromDatabaseRow(row: PaymentRefundDatabaseRow): PaymentRefund {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    paymentId: row.payment_id,
    salesOrderId: row.sales_order_id,
    amount: Number(row.amount),
    createdAt: row.created_at,
    reference: row.reference ?? undefined,
  };
}

class SupabasePaymentRefundRepository
  implements PaymentRefundRepository
{
  async findByPaymentId(
    tenantId: string,
    paymentId: string,
  ): Promise<PaymentRefund[]> {
    const { data, error } = await supabase
      .from("payment_refunds")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return ((data ?? []) as PaymentRefundDatabaseRow[]).map(
      fromDatabaseRow,
    );
  }

  async create(
    refund: PaymentRefund,
  ): Promise<PaymentRefund> {
    const { data, error } = await supabase
      .from("payment_refunds")
      .insert({
        id: refund.id,
        tenant_id: refund.tenantId,
        payment_id: refund.paymentId,
        sales_order_id: refund.salesOrderId,
        amount: refund.amount,
        created_at: refund.createdAt,
        reference: refund.reference ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;

    return fromDatabaseRow(
      data as PaymentRefundDatabaseRow,
    );
  }
}

export const supabasePaymentRefundRepository =
  new SupabasePaymentRefundRepository();
