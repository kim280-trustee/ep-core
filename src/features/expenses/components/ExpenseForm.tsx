import { useEffect, useState } from "react";
import type { ExpenseCategory } from "../types";
import type { ExpenseFormInput } from "../validators/expense.schema";
import { expenseSchema } from "../validators/expense.schema";
import { useTranslation } from "@/core/i18n/useTranslation";

interface ExpenseFormProps {
  initialValues?: Partial<ExpenseFormInput>;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
  onSubmit: (data: ExpenseFormInput) => void | Promise<void>;
  onCancel: () => void;
}

const categories: ExpenseCategory[] = ["RENT", "SALARY", "ELECTRICITY", "WATER", "INTERNET", "TRANSPORT", "MARKETING", "OFFICE_SUPPLIES", "MAINTENANCE", "OTHER"];

export function ExpenseForm({ initialValues, submitting = false, error, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<ExpenseCategory>(initialValues?.category ?? "OTHER");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [amount, setAmount] = useState(initialValues?.amount !== undefined ? String(initialValues.amount) : "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "THB");
  const [expenseDate, setExpenseDate] = useState(initialValues?.expenseDate ? initialValues.expenseDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) return;
    setCategory(initialValues.category ?? "OTHER");
    setDescription(initialValues.description ?? "");
    setAmount(initialValues.amount !== undefined ? String(initialValues.amount) : "");
    setCurrency(initialValues.currency ?? "THB");
    setExpenseDate(initialValues.expenseDate ? initialValues.expenseDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    const result = expenseSchema.safeParse({ category, description: description.trim(), amount: Number(amount), currency: currency.trim().toUpperCase(), expenseDate });
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? t("common.required"));
      return;
    }
    await onSubmit(result.data);
  }

  const formError = validationError ?? error;
  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded border p-6">
      {formError && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
      <div className="space-y-2"><label htmlFor="expense-category" className="block text-sm font-medium">{t("expenses.category")}</label><select id="expense-category" value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)} disabled={submitting} className="w-full rounded border px-3 py-2">{categories.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></div>
      <div className="space-y-2"><label htmlFor="expense-description" className="block text-sm font-medium">{t("common.description")}</label><input id="expense-description" type="text" value={description} onChange={(event) => setDescription(event.target.value)} disabled={submitting} placeholder={t("common.description")} className="w-full rounded border px-3 py-2" /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><label htmlFor="expense-amount" className="block text-sm font-medium">{t("expenses.amount")}</label><input id="expense-amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={submitting} placeholder="0.00" className="w-full rounded border px-3 py-2" /></div>
        <div className="space-y-2"><label htmlFor="expense-currency" className="block text-sm font-medium">{t("common.currency")}</label><input id="expense-currency" type="text" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} disabled={submitting} placeholder="THB" className="w-full rounded border px-3 py-2 uppercase" /></div>
      </div>
      <div className="space-y-2"><label htmlFor="expense-date" className="block text-sm font-medium">{t("common.date")}</label><input id="expense-date" type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} disabled={submitting} className="w-full rounded border px-3 py-2" /></div>
      <div className="flex gap-3"><button type="submit" disabled={submitting} className="rounded border px-4 py-2 text-sm">{submitting ? t("expenses.saving") : submitLabel ?? t("expenses.saveExpense")}</button><button type="button" onClick={onCancel} disabled={submitting} className="rounded border px-4 py-2 text-sm">{t("common.cancel")}</button></div>
    </form>
  );
}
