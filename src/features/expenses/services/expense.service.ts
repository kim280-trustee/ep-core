import { expenseRepository } from "../repositories";

import type {
  Expense,
  ExpenseCategory,
} from "../types";

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
  async createExpense(
    input: CreateExpenseInput,
  ): Promise<Expense> {
    if (!input.tenantId) {
      throw new Error("Tenant ID is required.");
    }

    if (!input.storeId) {
      throw new Error("Store ID is required.");
    }

    if (!input.category) {
      throw new Error("Expense category is required.");
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Expense amount must be greater than zero.");
    }

    if (!input.currency) {
      throw new Error("Currency is required.");
    }

    if (!input.expenseDate) {
      throw new Error("Expense date is required.");
    }

    const now =
      new Date().toISOString();

    const expense: Expense = {
      id:
        crypto.randomUUID(),

      tenantId:
        input.tenantId,

      storeId:
        input.storeId,

      category:
        input.category,

      description:
        input.description.trim(),

      amount:
        input.amount,

      currency:
        input.currency,

      expenseDate:
        input.expenseDate,

      createdAt:
        now,

      updatedAt:
        now,
    };

    return expenseRepository.create(
      expense,
    );
  }

  async getExpenses(
    tenantId: string,
    storeId: string,
  ): Promise<Expense[]> {
    return expenseRepository.findAll(
      tenantId,
      storeId,
    );
  }

  async getExpenseById(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<Expense | undefined> {
    return expenseRepository.findById(
      tenantId,
      storeId,
      id,
    );
  }

  async updateExpense(
    tenantId: string,
    storeId: string,
    id: string,
    updates: Partial<Expense>,
  ): Promise<Expense | undefined> {
    return expenseRepository.update(
      tenantId,
      storeId,
      id,
      updates,
    );
  }

  async deleteExpense(
    tenantId: string,
    storeId: string,
    id: string,
  ): Promise<void> {
    return expenseRepository.delete(
      tenantId,
      storeId,
      id,
    );
  }
}

export const expenseService =
  new ExpenseService();
