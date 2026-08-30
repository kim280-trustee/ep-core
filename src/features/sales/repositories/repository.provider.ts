import type {
  SalesOrderRepository,
} from "./sales-order.repository";

import {
  inMemorySalesOrderRepository,
} from "./in-memory.sales-order.repository";

let salesOrderRepository: SalesOrderRepository =
  inMemorySalesOrderRepository;

export { salesOrderRepository };

export function getSalesOrderRepository(): SalesOrderRepository {
  return salesOrderRepository;
}

export function setSalesOrderRepository(
  repository: SalesOrderRepository,
): void {
  salesOrderRepository = repository;
}
