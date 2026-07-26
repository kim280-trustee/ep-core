import type { ExpenseCategory } from "./expense-category.types";

export interface Expense {
  id: string;

  tenantId: string;

  storeId: string;

  category: ExpenseCategory;

  description: string;

  amount: number;

  currency: string;

  expenseDate: string;

  createdAt: string;

  updatedAt: string;
}