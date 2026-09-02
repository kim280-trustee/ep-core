import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useExpenses,
} from "../hooks/useExpenses";

import {
  storeContext,
} from "@/core/store/store.context";

export function ExpensesPage() {

  const navigate =
    useNavigate();

  const {
    expenses,
    loading,
    error,
    refresh,
    deleteExpense,
  } = useExpenses();

  const [
    search,
    setSearch,
  ] = useState("");

  const context =
    storeContext.getStore();

  useEffect(() => {

    if (!context) {
      return;
    }

    void refresh(
      context.tenantId,
      context.storeId,
    );

  }, [
    context?.tenantId,
    context?.storeId,
    refresh,
  ]);

  const filteredExpenses =
    useMemo(
      () => {

        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return expenses;
        }

        return expenses.filter(
          (expense) =>
            expense.description
              .toLowerCase()
              .includes(term) ||
            expense.category
              .toLowerCase()
              .includes(term),
        );

      },
      [
        expenses,
        search,
      ],
    );

  const totalExpenses =
    filteredExpenses.reduce(
      (
        total,
        expense,
      ) =>
        total +
        expense.amount,
      0,
    );

  async function handleDelete(
    id: string,
  ) {

    if (!context) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this expense?",
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteExpense(
        context.tenantId,
        context.storeId,
        id,
      );

    } catch {
      // Error is already exposed by the hook.
    }
  }

  if (!context) {

    return (
      <div className="p-6">

        <h1 className="text-2xl font-semibold">
          Expenses
        </h1>

        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Store context is not initialized.
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-semibold">
            Expenses
          </h1>

          <p className="text-sm text-gray-500">
            Track business expenses.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/expenses/create")
          }
          className="rounded border px-4 py-2 text-sm"
        >
          Add Expense
        </button>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <div className="rounded border p-4">

          <p className="text-sm text-gray-500">
            Expenses
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {expenses.length}
          </p>

        </div>

        <div className="rounded border p-4">

          <p className="text-sm text-gray-500">
            Total
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {totalExpenses.toFixed(2)}
          </p>

        </div>

      </div>

      <div className="flex gap-3">

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search expenses..."
          className="w-full rounded border px-4 py-2"
        />

        <button
          type="button"
          onClick={() =>
            void refresh(
              context.tenantId,
              context.storeId,
            )
          }
          disabled={loading}
          className="rounded border px-4 py-2 text-sm"
        >
          {loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded border">

        <table className="w-full text-sm">

          <thead>

            <tr className="border-b text-left">

              <th className="p-3">
                Date
              </th>

              <th className="p-3">
                Category
              </th>

              <th className="p-3">
                Description
              </th>

              <th className="p-3 text-right">
                Amount
              </th>

              <th className="p-3">
                Currency
              </th>

              <th className="p-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {loading &&
            expenses.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  Loading expenses...
                </td>

              </tr>

            ) : filteredExpenses.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No expenses found.
                </td>

              </tr>

            ) : (

              filteredExpenses.map(
                (expense) => (

                  <tr
                    key={expense.id}
                    className="border-b"
                  >

                    <td className="p-3">
                      {new Date(
                        expense.expenseDate,
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      {expense.category.replaceAll(
                        "_",
                        " ",
                      )}
                    </td>

                    <td className="p-3">
                      {expense.description}
                    </td>

                    <td className="p-3 text-right">
                      {expense.amount.toFixed(2)}
                    </td>

                    <td className="p-3">
                      {expense.currency}
                    </td>

                    <td className="p-3">

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/expenses/${expense.id}/edit`,
                            )
                          }
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(
                              expense.id,
                            )
                          }
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ),
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
