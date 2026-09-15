import { supabase } from "@/core/infrastructure/supabase/client";
import type { SupplierCreditLedgerEntry } from "../types/supplier-credit-ledger.types";
import type { SupplierCreditLedgerRepository } from "./supplier-credit-ledger.repository";

interface DatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string;
  supplier_id: string;
  entry_type: SupplierCreditLedgerEntry["entryType"];
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  description: string | null;
  debit: number | string;
  credit: number | string;
  created_at: string;
}

function fromRow(row: DatabaseRow): SupplierCreditLedgerEntry {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    storeId: row.store_id,
    supplierId: row.supplier_id,
    entryType: row.entry_type,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    referenceNumber: row.reference_number,
    description: row.description,
    debit: Number(row.debit),
    credit: Number(row.credit),
    createdAt: row.created_at,
  };
}

class SupabaseSupplierCreditLedgerRepository
  implements SupplierCreditLedgerRepository {
  async findAll(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierCreditLedgerEntry[]> {
    let query = supabase
      .from("supplier_credit_ledger")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("store_id", storeId);

    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) throw error;

    return (data ?? []).map((row) =>
      fromRow(row as DatabaseRow),
    );
  }

  async create(
    entry: SupplierCreditLedgerEntry,
  ): Promise<SupplierCreditLedgerEntry> {
    const { data, error } = await supabase
      .from("supplier_credit_ledger")
      .insert({
        id: entry.id,
        tenant_id: entry.tenantId,
        store_id: entry.storeId,
        supplier_id: entry.supplierId,
        entry_type: entry.entryType,
        reference_type: entry.referenceType,
        reference_id: entry.referenceId,
        reference_number: entry.referenceNumber,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        created_at: entry.createdAt,
      })
      .select("*")
      .single();

    if (error) throw error;

    return fromRow(data as DatabaseRow);
  }
}

export const supabaseSupplierCreditLedgerRepository =
  new SupabaseSupplierCreditLedgerRepository();
