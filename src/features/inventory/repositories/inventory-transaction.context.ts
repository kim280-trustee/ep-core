import {
  supabaseInventoryTransactionRepository,
} from "./supabase.inventory-transaction.repository";

export const inventoryTransactionContext = {
  repository:
    supabaseInventoryTransactionRepository,
};