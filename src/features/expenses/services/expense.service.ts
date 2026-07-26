import { expenseRepository } from "../repositories";

import type { Expense } from "../types";
import type { ExpenseCategory } from "../types";

export interface CreateExpenseInput {
  tenantId: string;
  storeId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
}

class ExpenseService {
  createExpense(
    input: CreateExpenseInput,
  ): Expense {
    const expense: Expense = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      expenseDate: input.expenseDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return expenseRepository.create(expense);
  }

  getExpenses(): Expense[] {
    return expenseRepository.findAll();
  }

  getExpenseById(
    id: string,
  ): Expense | undefined {
    return expenseRepository.findById(id);
  }
}

export const expenseService =
  new ExpenseService();