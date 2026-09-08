import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExpenseForm } from "../components/ExpenseForm";
import { useExpenses } from "../hooks/useExpenses";
import { storeContext } from "@/core/store/store.context";
import type { Expense } from "../types";
import type { ExpenseFormInput } from "../validators/expense.schema";
import { useTranslation } from "@/core/i18n/useTranslation";

export function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getExpenseById, updateExpense } = useExpenses();
  const context = storeContext.getStore();
  const [expense, setExpense] = useState<Expense | undefined>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!context || !id) { setLoading(false); return; }
      try {
        setLoading(true); setError(null);
        setExpense(await getExpenseById(context.tenantId, context.storeId, id));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("expenses.unableToLoadExpense"));
      } finally { setLoading(false); }
    }
    void load();
  }, [context?.tenantId, context?.storeId, id, getExpenseById, t]);

  async function handleSubmit(data: ExpenseFormInput) {
    if (!context || !id) return;
    try {
      setSubmitting(true); setError(null);
      const updated = await updateExpense(context.tenantId, context.storeId, id, { category: data.category, description: data.description, amount: data.amount, currency: data.currency, expenseDate: new Date(`${data.expenseDate}T00:00:00`).toISOString() });
      setExpense(updated);
      navigate("/expenses");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("expenses.unableToUpdateExpense"));
    } finally { setSubmitting(false); }
  }

  if (!context) return <div className="space-y-4 p-6"><h1 className="text-2xl font-semibold">{t("expenses.editExpense")}</h1><div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{t("expenses.storeContextNotInitialized")}</div><button type="button" onClick={() => navigate("/expenses")} className="rounded border px-4 py-2">{t("common.back")}</button></div>;
  if (loading) return <div className="space-y-4 p-6"><h1 className="text-2xl font-semibold">{t("expenses.editExpense")}</h1><p className="text-sm text-gray-500">{t("expenses.loadingExpense")}</p></div>;
  if (!expense) return <div className="space-y-4 p-6"><h1 className="text-2xl font-semibold">{t("expenses.editExpense")}</h1><div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error ?? t("expenses.expenseNotFound")}</div><button type="button" onClick={() => navigate("/expenses")} className="rounded border px-4 py-2">{t("common.back")}</button></div>;

  return <div className="space-y-6 p-6"><div><h1 className="text-2xl font-semibold">{t("expenses.editExpense")}</h1><p className="text-sm text-gray-500">{t("expenses.updateDescription")}</p></div><ExpenseForm initialValues={{ category: expense.category, description: expense.description, amount: expense.amount, currency: expense.currency, expenseDate: expense.expenseDate }} submitting={submitting} error={error} submitLabel={t("expenses.updateExpense")} onSubmit={handleSubmit} onCancel={() => navigate("/expenses")} /></div>;
}
