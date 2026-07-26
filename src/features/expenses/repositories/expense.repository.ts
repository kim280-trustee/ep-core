import type { Expense } from "../types";

export interface ExpenseRepository {
  findAll(): Expense[];

  findById(
    id: string,
  ): Expense | undefined;

  create(
    expense: Expense,
  ): Expense;

  update(
    id: string,
    updates: Partial<Expense>,
  ): Expense | undefined;
}