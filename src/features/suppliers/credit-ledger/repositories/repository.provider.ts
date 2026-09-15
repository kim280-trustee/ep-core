import type { SupplierCreditLedgerRepository } from "./supplier-credit-ledger.repository";
import { supabaseSupplierCreditLedgerRepository } from "./supabase.supplier-credit-ledger.repository";

let repository: SupplierCreditLedgerRepository =
  supabaseSupplierCreditLedgerRepository;

export function getSupplierCreditLedgerRepository(): SupplierCreditLedgerRepository {
  return repository;
}

export function setSupplierCreditLedgerRepository(
  implementation: SupplierCreditLedgerRepository,
): void {
  repository = implementation;
}
