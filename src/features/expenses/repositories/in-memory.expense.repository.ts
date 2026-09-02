import type { Expense } from "../types";
import type { ExpenseRepository } from "./expense.repository";

class InMemoryExpenseRepository implements ExpenseRepository {
  private expenses: Expense[] = [];

  async findAll(
    tenantId: string,
    storeId: string,
  ): Promise<Expense[]> {
    return this.expenses.filter(
      (expense) =>
        expense.tenantId === tenantId &&
        expense.storeId === storeId,
    );
  }

  async findById(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<Expense | undefined> {
    return this.expenses.find(
      (expense) =>
        expense.tenantId === tenantId &&
        expense.storeId === storeId &&
        expense.id === id,
    );
  }

  async create(
    expense: Expense,
  ): Promise<Expense> {
    this.expenses.push(expense);
    return expense;
  }

  async update(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Expense>,
  ): Promise<Expense | undefined> {
    const index = this.expenses.findIndex(
      (expense) =>
        expense.tenantId === tenantId &&
        expense.storeId === storeId &&
        expense.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    this.expenses[index] = {
      ...this.expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.expenses[index];
  }

  async delete(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<void> {
    this.expenses = this.expenses.filter(
      (expense) =>
        !(
          expense.tenantId === tenantId &&
          expense.storeId === storeId &&
          expense.id === id
        ),
    );
  }
}

export const inMemoryExpenseRepository =
  new InMemoryExpenseRepository();
