import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
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
  Expense,
} from "../types";

import type {
  ExpenseFormInput,
} from "../validators/expense.schema";

export function EditExpensePage() {

  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

  const {
    getExpenseById,
    updateExpense,
  } = useExpenses();

  const context =
    storeContext.getStore();

  const [
    expense,
    setExpense,
  ] = useState<Expense | undefined>();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {

    async function load() {

      if (
        !context ||
        !id
      ) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError(null);

        const result =
          await getExpenseById(
            context.tenantId,
            context.storeId,
            id,
          );

        setExpense(result);

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load expense.",
        );

      } finally {

        setLoading(false);

      }
    }

    void load();

  }, [
    context?.tenantId,
    context?.storeId,
    id,
    getExpenseById,
  ]);

  async function handleSubmit(
    data: ExpenseFormInput,
  ) {

    if (
      !context ||
      !id
    ) {
      return;
    }

    try {

      setSubmitting(true);
      setError(null);

      const updated =
        await updateExpense(
          context.tenantId,
          context.storeId,
          id,
          {
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
          },
        );

      setExpense(updated);

      navigate("/expenses");

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update expense.",
      );

    } finally {

      setSubmitting(false);

    }
  }

  if (!context) {

    return (
      <div className="space-y-4 p-6">

        <h1 className="text-2xl font-semibold">
          Edit Expense
        </h1>

        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Store context is not initialized.
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/expenses")
          }
          className="rounded border px-4 py-2"
        >
          Back to Expenses
        </button>

      </div>
    );
  }

  if (loading) {

    return (
      <div className="space-y-4 p-6">

        <h1 className="text-2xl font-semibold">
          Edit Expense
        </h1>

        <p className="text-sm text-gray-500">
          Loading expense...
        </p>

      </div>
    );
  }

  if (!expense) {

    return (
      <div className="space-y-4 p-6">

        <h1 className="text-2xl font-semibold">
          Edit Expense
        </h1>

        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error ?? "Expense not found."}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/expenses")
          }
          className="rounded border px-4 py-2"
        >
          Back to Expenses
        </button>

      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <div>

        <h1 className="text-2xl font-semibold">
          Edit Expense
        </h1>

        <p className="text-sm text-gray-500">
          Update the expense details.
        </p>

      </div>

      <ExpenseForm
        initialValues={{
          category:
            expense.category,

          description:
            expense.description,

          amount:
            expense.amount,

          currency:
            expense.currency,

          expenseDate:
            expense.expenseDate,
        }}
        submitting={submitting}
        error={error}
        submitLabel="Update Expense"
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate("/expenses")
        }
      />

    </div>
  );
}
