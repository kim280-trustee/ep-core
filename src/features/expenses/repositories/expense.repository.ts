import type { Expense } from "../types";

export interface ExpenseRepository {
  findAll(
    tenantId: string,
    storeId: string,
  ): Promise<Expense[]>;

  findById(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<Expense | undefined>;

  create(
    expense: Expense,
  ): Promise<Expense>;

  update(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Expense>,
  ): Promise<Expense | undefined>;

  delete(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<void>;
}
