import type { GoodsReceiptRepository } from "./goods-receipt.repository";
import { supabaseGoodsReceiptRepository } from "./supabase.goods-receipt.repository";

let repository: GoodsReceiptRepository =
  supabaseGoodsReceiptRepository;

export function getGoodsReceiptRepository():
  GoodsReceiptRepository {
  return repository;
}

export function setGoodsReceiptRepository(
  implementation: GoodsReceiptRepository,
): void {
  repository = implementation;
}
