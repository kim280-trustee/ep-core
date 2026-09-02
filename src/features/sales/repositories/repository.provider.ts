import {
  supabaseSalesOrderRepository,
} from "./supabase.sales-order.repository";

export const salesOrderRepository =
  supabaseSalesOrderRepository;

export function getSalesOrderRepository() {
  return salesOrderRepository;
}

export function setSalesOrderRepository(
  repository: typeof salesOrderRepository,
): void {
  void repository;
}
