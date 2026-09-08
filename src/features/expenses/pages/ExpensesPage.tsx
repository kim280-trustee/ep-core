import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../hooks/useExpenses";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";
import type { ExpenseCategory } from "../types";

const thaiCategoryLabels: Record<ExpenseCategory, string> = {
  RENT: "ค่าเช่า",
  SALARY: "เงินเดือน",
  ELECTRICITY: "ค่าไฟฟ้า",
  WATER: "ค่าน้ำ",
  INTERNET: "ค่าอินเทอร์เน็ต",
  TRANSPORT: "ค่าขนส่ง",
  MARKETING: "การตลาด",
  OFFICE_SUPPLIES: "อุปกรณ์สำนักงาน",
  MAINTENANCE: "ค่าบำรุงรักษา",
  OTHER: "อื่นๆ",
};

export function ExpensesPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { expenses, loading, error, refresh, deleteExpense } = useExpenses();
  const [search, setSearch] = useState("");
  const context = storeContext.getStore();
  useEffect(() => { if (context) void refresh(context.tenantId, context.storeId); }, [context?.tenantId, context?.storeId, refresh]);
  const filteredExpenses = useMemo(() => { const term = search.trim().toLowerCase(); if (!term) return expenses; return expenses.filter((expense) => expense.description.toLowerCase().includes(term) || expense.category.toLowerCase().includes(term)); }, [expenses, search]);
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const categoryLabel = (category: ExpenseCategory) => language === "th" ? thaiCategoryLabels[category] : category.replaceAll("_", " ");
  async function handleDelete(id: string) { if (!context || !window.confirm(`${t("common.delete")}?`)) return; try { await deleteExpense(context.tenantId, context.storeId, id); } catch { /* hook exposes the error */ } }
  if (!context) return <div className="p-6"><h1 className="text-2xl font-semibold">{t("expenses.title")}</h1><div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{t("sales.storeContextNotInitialized")}</div></div>;
  return <div className="space-y-6 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-semibold">{t("expenses.title")}</h1><p className="text-sm text-gray-500">{t("common.description")}</p></div><button type="button" onClick={() => navigate("/expenses/create")} className="rounded border px-4 py-2 text-sm">{t("expenses.addExpense")}</button></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded border p-4"><p className="text-sm text-gray-500">{t("expenses.title")}</p><p className="mt-1 text-2xl font-semibold">{expenses.length}</p></div><div className="rounded border p-4"><p className="text-sm text-gray-500">{t("common.total")}</p><p className="mt-1 text-2xl font-semibold">{totalExpenses.toFixed(2)}</p></div></div><div className="flex gap-3"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("common.search")} className="w-full rounded border px-4 py-2" /><button type="button" onClick={() => void refresh(context.tenantId, context.storeId)} disabled={loading} className="rounded border px-4 py-2 text-sm">{loading ? t("common.loading") : t("common.refresh")}</button></div>{error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="overflow-x-auto rounded border"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">{t("common.date")}</th><th className="p-3">{t("expenses.category")}</th><th className="p-3">{t("common.description")}</th><th className="p-3 text-right">{t("expenses.amount")}</th><th className="p-3">{t("common.currency")}</th><th className="p-3">{t("common.actions")}</th></tr></thead><tbody>{loading && expenses.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">{t("common.loading")}</td></tr> : filteredExpenses.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">{t("expenses.noExpenses")}</td></tr> : filteredExpenses.map((expense) => <tr key={expense.id} className="border-b"><td className="p-3">{new Date(expense.expenseDate).toLocaleDateString()}</td><td className="p-3">{categoryLabel(expense.category)}</td><td className="p-3">{expense.description}</td><td className="p-3 text-right">{expense.amount.toFixed(2)}</td><td className="p-3">{expense.currency}</td><td className="p-3"><div className="flex gap-2"><button type="button" onClick={() => navigate(`/expenses/${expense.id}/edit`)} className="rounded border px-3 py-1 text-sm">{t("common.edit")}</button><button type="button" onClick={() => void handleDelete(expense.id)} className="rounded border px-3 py-1 text-sm">{t("common.delete")}</button></div></td></tr>)}</tbody></table></div></div>;
}
