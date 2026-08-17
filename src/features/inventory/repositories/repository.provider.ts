/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Repository Provider
 * ============================================================
 */

import {
  supabaseInventoryRepository,
} from "./supabase.inventory.repository";

import {
  supabaseInventoryTransactionRepository,
} from "./supabase.inventory-transaction.repository";

export const inventoryRepositoryProvider =
  supabaseInventoryRepository;

export const inventoryTransactionRepositoryProvider =
  supabaseInventoryTransactionRepository;