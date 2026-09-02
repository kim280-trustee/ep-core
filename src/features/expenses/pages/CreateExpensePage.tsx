import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ExpenseForm,
} from "../components/ExpenseForm";

import {
  useExpenses,
} from "../hooks/useExpenses";

import {
  storeContext,
} from "@/core/store/store.context";

import type {
  ExpenseFormInput,
} from "../validators/expense.schema";

export function CreateExpensePage() {

  const navigate =
    useNavigate();

  const {
    createExpense,
    error,
  } = useExpenses();

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const context =
    storeContext.getStore();

  async function handleSubmit(
    data: ExpenseFormInput,
  ) {

    if (!context) {
      return;
    }

    try {

      setSubmitting(true);

      await createExpense({
        tenantId:
          context.tenantId,

        storeId:
          context.storeId,

        category:
          data.category,

        description:
          data.description,

        amount:
          data.amount,

        currency:
          data.currency,

        expenseDate:
          new Date(
            `${data.expenseDate}T00:00:00`,
          ).toISOString(),
      });

      navigate("/expenses");

    } finally {

      setSubmitting(false);

    }
  }

  if (!context) {

    return (
      <div className="space-y-4 p-6">

        <h1 className="text-2xl font-semibold">
          Create Expense
        </h1>

        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Store context is not initialized.
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <div>

        <h1 className="text-2xl font-semibold">
          Create Expense
        </h1>

        <p className="text-sm text-gray-500">
          Record a new business expense.
        </p>

      </div>

      <ExpenseForm
        submitting={submitting}
        error={error}
        submitLabel="Save Expense"
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate("/expenses")
        }
      />

    </div>
  );
}

