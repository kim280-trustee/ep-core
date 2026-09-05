import type { PurchaseReturnRepository } from "./purchase-return.repository";
import { supabasePurchaseReturnRepository } from "./supabase.purchase-return.repository";

let repository: PurchaseReturnRepository =
  supabasePurchaseReturnRepository;

export function getPurchaseReturnRepository(): PurchaseReturnRepository {
  return repository;
}

export function setPurchaseReturnRepository(
  implementation: PurchaseReturnRepository,
): void {
  repository = implementation;
}
