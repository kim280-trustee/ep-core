import {
  useCallback,
  useState,
} from "react";

import {
  expenseService,
} from "../services/expense.service";

import type {
  Expense,
} from "../types";

import type {
  CreateExpenseInput,
} from "../services/expense.service";

export function useExpenses() {
  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadExpenses =
    useCallback(
      async (
        tenantId: string,
        storeId: string,
      ) => {
        try {
          setLoading(true);
          setError(null);

          const data =
            await expenseService.getExpenses(
              tenantId,
              storeId,
            );

          setExpenses(data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load expenses.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  const createExpense =
    useCallback(
      async (
        input: CreateExpenseInput,
      ) => {
        try {
          setError(null);

          const expense =
            await expenseService.createExpense(
              input,
            );

          setExpenses(
            (current) => [
              ...current,
              expense,
            ],
          );

          return expense;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to create expense.";

          setError(message);
          throw err;
        }
      },
      [],
    );

  const updateExpense =
    useCallback(
      async (
        tenantId: string,
        storeId: string,
        id: string,
        updates: Partial<Expense>,
      ) => {
        try {
          setError(null);

          const updated =
            await expenseService.updateExpense(
              tenantId,
              storeId,
              id,
              updates,
            );

          if (!updated) {
            throw new Error(
              "Expense not found.",
            );
          }

          setExpenses(
            (current) =>
              current.map(
                (expense) =>
                  expense.id === id
                    ? updated
                    : expense,
              ),
          );

          return updated;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to update expense.";

          setError(message);
          throw err;
        }
      },
      [],
    );

  const deleteExpense =
    useCallback(
      async (
        tenantId: string,
        storeId: string,
        id: string,
      ) => {
        try {
          setError(null);

          await expenseService.deleteExpense(
            tenantId,
            storeId,
            id,
          );

          setExpenses(
            (current) =>
              current.filter(
                (expense) =>
                  expense.id !== id,
              ),
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to delete expense.";

          setError(message);
          throw err;
        }
      },
      [],
    );

  const getExpenseById =
    useCallback(
      async (
        tenantId: string,
        storeId: string,
        id: string,
      ) => {
        return expenseService.getExpenseById(
          tenantId,
          storeId,
          id,
        );
      },
      [],
    );

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    refresh: loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
  };
}
