import type { PurchaseOrder } from "../types/purchase-order.types";
import { useTranslation } from "@/core/i18n/useTranslation";

interface PurchaseOrderSummaryProps { order: PurchaseOrder; }

export function PurchaseOrderSummary({ order }: PurchaseOrderSummaryProps) {
  const { t } = useTranslation();
  const currency = order.currency || "THB";
  const formatMoney = (value: number) => new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  return <div><div className="mb-5"><h3 className="text-lg font-semibold text-slate-900">{t("purchasing.purchaseSummary")}</h3><p className="mt-1 text-sm text-slate-500">{t("purchasing.purchaseSummaryDescription")}</p></div><div className="ml-auto max-w-md space-y-3"><div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500">{t("common.subtotal")}</span><span className="font-medium text-slate-900">{formatMoney(order.subtotal)}</span></div><div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500">{t("purchasing.taxAmount")}</span><span className="font-medium text-slate-900">{formatMoney(order.taxAmount)}</span></div><div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-4"><span className="font-semibold text-slate-900">{t("purchasing.totalAmount")}</span><span className="text-xl font-bold text-slate-900">{formatMoney(order.totalAmount)}</span></div></div></div>;
}
