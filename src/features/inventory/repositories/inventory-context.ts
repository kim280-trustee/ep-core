import {
  supabaseInventoryRepository,
} from "./supabase.inventory.repository";

export const inventoryContext = {
  repository:
    supabaseInventoryRepository,
};