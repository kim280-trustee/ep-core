import type { Expense } from "../types";
import type { ExpenseRepository } from "./expense.repository";

class InMemoryExpenseRepository implements ExpenseRepository {
  private expenses: Expense[] = [];

  findAll(): Expense[] {
    return this.expenses;
  }

  findById(
    id: string,
  ): Expense | undefined {
    return this.expenses.find(
      (expense) => expense.id === id,
    );
  }

  create(
    expense: Expense,
  ): Expense {
    this.expenses.push(expense);

    return expense;
  }

  update(
    id: string,
    updates: Partial<Expense>,
  ): Expense | undefined {
    const index = this.expenses.findIndex(
      (expense) => expense.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    this.expenses[index] = {
      ...this.expenses[index],
      ...updates,
    };

    return this.expenses[index];
  }
}

export const inMemoryExpenseRepository =
  new InMemoryExpenseRepository();