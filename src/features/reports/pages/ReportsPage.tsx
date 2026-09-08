import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useReports } from "../hooks";
import type { ReportDateRange, ReportFilter } from "../types";
import { storeContext } from "@/core/store/store.context";
import { countries } from "@/core/config/country.config";
import { useTranslation } from "@/core/i18n/useTranslation";

function formatMoney(value: number, currency?: string) {
  if (!currency) return value.toLocaleString();
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toLocaleDateString();
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPresetRange(preset: string): ReportDateRange | undefined {
  const today = new Date();
  if (preset === "all") return undefined;
  if (preset === "today") {
    const value = formatDateInput(today);
    return { from: value, to: value };
  }
  if (preset === "week") {
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
    return { from: formatDateInput(start), to: formatDateInput(today) };
  }
  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: formatDateInput(start), to: formatDateInput(today) };
  }
  return undefined;
}

function StatusBadge({ value }: { value: string }) {
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">{value.replaceAll("_", " ")}</span>;
}

export function ReportsPage() {
  const { t, language } = useTranslation();
  const context = storeContext.getStore();
  const [preset, setPreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const th = language === "th";

  const labels = {
    all: th ? "ทั้งหมด" : "All time",
    today: th ? "วันนี้" : "Today",
    week: th ? "สัปดาห์นี้" : "This week",
    month: th ? "เดือนนี้" : "This month",
    custom: th ? "กำหนดเอง" : "Custom",
    period: th ? "ช่วงเวลารายงาน" : "Report Period",
    periodHelp: th ? "เลือกช่วงเวลาสำหรับยอดขาย การจัดซื้อ ค่าใช้จ่าย และกำไร" : "Choose the period used for sales, purchases, expenses and profit.",
    completedSales: th ? "ยอดขายที่เสร็จสิ้น" : "Completed Sales",
    receivedPurchases: th ? "การซื้อที่รับสินค้าแล้ว" : "Received Purchases",
    profitLoss: th ? "กำไรและขาดทุน" : "Profit & Loss",
    order: th ? "คำสั่งซื้อ" : "Order",
    items: th ? "รายการ" : "Items",
    payment: th ? "การชำระเงิน" : "Payment",
    purchaseOrder: th ? "ใบสั่งซื้อ" : "Purchase Order",
    received: th ? "รับแล้ว" : "Received",
    ordered: th ? "สั่งซื้อ" : "Ordered",
    cogs: th ? "ต้นทุนสินค้าที่ขาย" : "Cost of Goods Sold",
    grossProfit: th ? "กำไรขั้นต้น" : "Gross Profit",
    noSales: th ? "ไม่พบยอดขายที่เสร็จสิ้นในช่วงเวลาที่เลือก" : "No completed sales found for the selected period.",
    noPurchases: th ? "ไม่พบรายการซื้อในช่วงเวลาที่เลือก" : "No purchases found for the selected period.",
    noExpenses: th ? "ไม่พบค่าใช้จ่ายในช่วงเวลาที่เลือก" : "No expenses found for the selected period.",
    noInventory: th ? "ไม่พบข้อมูลสินค้าคงคลัง" : "No inventory records found.",
    currencySummary: th ? "สรุปตามสกุลเงิน" : "Currency Summary",
  };

  const dateRange = useMemo<ReportDateRange | undefined>(() => {
    if (preset === "custom") {
      if (!customFrom && !customTo) return undefined;
      return { from: customFrom || undefined, to: customTo || undefined };
    }
    return getPresetRange(preset);
  }, [preset, customFrom, customTo]);

  const filter: ReportFilter | null = context?.tenantId
    ? { tenantId: context.tenantId, storeId: context.storeId || undefined, currency: countries.TH.currency, dateRange }
    : null;

  const { summary, loading, error } = useReports(filter);
  const primary = summary?.currencies[0];

  const cards = [
    { label: t("reports.salesReport"), value: primary ? formatMoney(primary.sales, primary.currency) : "—", icon: ShoppingCart },
    { label: t("reports.purchaseReport"), value: primary ? formatMoney(primary.purchases, primary.currency) : "—", icon: Package },
    { label: t("reports.expenseReport"), value: primary ? formatMoney(primary.expenses, primary.currency) : "—", icon: Wallet },
    { label: t("reports.totalProfit"), value: primary ? formatMoney(primary.netProfit, primary.currency) : "—", icon: TrendingUp },
    { label: t("reports.inventoryReport"), value: primary ? formatMoney(primary.inventoryValue, primary.currency) : "—", icon: DollarSign },
  ];

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center gap-3"><BarChart3 className="h-7 w-7" /><h1 className="text-2xl font-semibold">{t("reports.title")}</h1></div>

      {!context?.tenantId && <div className="rounded-lg border p-6 text-sm text-red-600">{th ? "บริบทธุรกิจยังไม่ได้เริ่มต้น" : "Business context is not initialized."}</div>}

      {context?.tenantId && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><h2 className="font-semibold">{labels.period}</h2><p className="mt-1 text-sm text-muted-foreground">{labels.periodHelp}</p></div>
            <div className="flex flex-wrap gap-2">
              {[["all", labels.all], ["today", labels.today], ["week", labels.week], ["month", labels.month], ["custom", labels.custom]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setPreset(value)} className={`rounded-md border px-3 py-2 text-sm ${preset === value ? "bg-primary text-primary-foreground" : "bg-background"}`}>{label}</button>
              ))}
            </div>
          </div>
          {preset === "custom" && <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm"><span className="font-medium">{th ? "จาก" : "From"}</span><input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium">{th ? "ถึง" : "To"}</span><input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2" /></label>
          </div>}
        </div>
      )}

      {loading && <div className="rounded-lg border p-6 text-sm">{th ? "กำลังโหลดรายงาน..." : "Loading reports..."}</div>}
      {error && <div className="rounded-lg border p-6 text-sm text-red-600">{error}</div>}

      {!loading && !error && context?.tenantId && <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{card.label}</span><Icon className="h-5 w-5 text-muted-foreground" /></div><div className="mt-3 text-xl font-semibold">{card.value}</div></div>; })}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{labels.completedSales}</p><p className="mt-2 text-2xl font-semibold">{summary?.completedSalesCount ?? 0}</p></div>
          <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{labels.receivedPurchases}</p><p className="mt-2 text-2xl font-semibold">{summary?.purchaseOrderCount ?? 0}</p></div>
          <div className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{t("reports.totalExpenses")}</p><p className="mt-2 text-2xl font-semibold">{summary?.expenseCount ?? 0}</p></div>
        </div>

        {primary && <div className="rounded-xl border"><div className="border-b p-5"><h2 className="font-semibold">{labels.profitLoss}</h2></div><div className="divide-y">
          <div className="flex items-center justify-between p-5"><span>{t("reports.salesReport")}</span><span className="font-medium">{formatMoney(primary.sales, primary.currency)}</span></div>
          <div className="flex items-center justify-between p-5"><span>{labels.cogs}</span><span className="font-medium">{formatMoney(primary.cogs, primary.currency)}</span></div>
          <div className="flex items-center justify-between bg-muted/30 p-5"><span className="font-semibold">{labels.grossProfit}</span><span className="font-semibold">{formatMoney(primary.grossProfit, primary.currency)}</span></div>
          <div className="flex items-center justify-between p-5"><span>{t("reports.expenseReport")}</span><span className="font-medium">{formatMoney(primary.expenses, primary.currency)}</span></div>
          <div className="flex items-center justify-between bg-muted/30 p-5"><span className="font-semibold">{t("reports.totalProfit")}</span><span className="font-semibold">{formatMoney(primary.netProfit, primary.currency)}</span></div>
        </div></div>}

        <div className="rounded-xl border"><div className="border-b p-5"><h2 className="font-semibold">{t("reports.salesReport")}</h2></div>
          {summary?.salesRows.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-4">{labels.order}</th><th className="p-4">{t("common.date")}</th><th className="p-4">{t("sales.customer")}</th><th className="p-4">{t("inventory.warehouse")}</th><th className="p-4">{labels.items}</th><th className="p-4">{t("common.total")}</th><th className="p-4">{labels.payment}</th></tr></thead><tbody>{summary.salesRows.map((row) => <tr key={row.orderNumber} className="border-b last:border-0"><td className="p-4 font-medium">{row.orderNumber}</td><td className="p-4">{formatDate(row.date)}</td><td className="p-4">{row.customerName}</td><td className="p-4">{row.warehouseName}</td><td className="p-4">{row.itemCount}</td><td className="p-4 font-medium">{formatMoney(row.totalAmount, primary?.currency)}</td><td className="p-4"><StatusBadge value={row.paymentStatus} /></td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-muted-foreground">{labels.noSales}</div>}
        </div>

        <div className="rounded-xl border"><div className="border-b p-5"><h2 className="font-semibold">{t("reports.purchaseReport")}</h2></div>
          {summary?.purchaseRows.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-4">{labels.purchaseOrder}</th><th className="p-4">{t("common.date")}</th><th className="p-4">{t("purchasing.supplier")}</th><th className="p-4">{t("inventory.warehouse")}</th><th className="p-4">{labels.received}</th><th className="p-4">{labels.ordered}</th><th className="p-4">{t("common.total")}</th><th className="p-4">{t("common.status")}</th></tr></thead><tbody>{summary.purchaseRows.map((row) => <tr key={row.orderNumber} className="border-b last:border-0"><td className="p-4 font-medium">{row.orderNumber}</td><td className="p-4">{formatDate(row.date)}</td><td className="p-4">{row.supplierName}</td><td className="p-4">{row.warehouseName}</td><td className="p-4">{row.receivedQuantity}</td><td className="p-4">{row.totalQuantity}</td><td className="p-4 font-medium">{formatMoney(row.totalAmount, row.currency)}</td><td className="p-4"><StatusBadge value={row.status} /></td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-muted-foreground">{labels.noPurchases}</div>}
        </div>

        <div className="rounded-xl border"><div className="border-b p-5"><h2 className="font-semibold">{t("reports.expenseReport")}</h2></div>
          {summary?.expenseRows.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-4">{t("common.date")}</th><th className="p-4">{t("expenses.category")}</th><th className="p-4">{t("common.description")}</th><th className="p-4">{t("expenses.amount")}</th></tr></thead><tbody>{summary.expenseRows.map((row, index) => <tr key={`${row.date}-${row.description}-${index}`} className="border-b last:border-0"><td className="p-4">{formatDate(row.date)}</td><td className="p-4">{row.category}</td><td className="p-4">{row.description}</td><td className="p-4 font-medium">{formatMoney(row.amount, row.currency)}</td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-muted-foreground">{labels.noExpenses}</div>}
        </div>

        <div className="rounded-xl border"><div className="border-b p-5"><h2 className="font-semibold">{t("reports.inventoryReport")}</h2></div>
          {summary?.inventoryRows.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-4">{t("inventory.product")}</th><th className="p-4">{t("inventory.warehouse")}</th><th className="p-4">{t("inventory.onHand")}</th><th className="p-4">{t("inventory.available")}</th><th className="p-4">{t("inventory.averageCost")}</th><th className="p-4">{t("reports.inventoryReport")}</th><th className="p-4">{t("common.status")}</th></tr></thead><tbody>{summary.inventoryRows.map((row) => <tr key={`${row.productName}-${row.warehouseName}`} className="border-b last:border-0"><td className="p-4 font-medium">{row.productName}</td><td className="p-4">{row.warehouseName}</td><td className="p-4">{row.quantityOnHand}</td><td className="p-4">{row.availableQuantity}</td><td className="p-4">{formatMoney(row.averageCost, primary?.currency)}</td><td className="p-4 font-medium">{formatMoney(row.inventoryValue, primary?.currency)}</td><td className="p-4"><StatusBadge value={row.stockStatus} /></td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-muted-foreground">{labels.noInventory}</div>}
        </div>

        {summary && summary.currencies.length > 1 && <div className="rounded-xl border"><div className="border-b p-5"><h2 className="font-semibold">{labels.currencySummary}</h2></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-4">{t("common.currency")}</th><th className="p-4">{t("reports.salesReport")}</th><th className="p-4">{t("reports.purchaseReport")}</th><th className="p-4">{t("reports.expenseReport")}</th><th className="p-4">{labels.cogs}</th><th className="p-4">{t("reports.totalProfit")}</th></tr></thead><tbody>{summary.currencies.map((row) => <tr key={row.currency} className="border-b last:border-0"><td className="p-4 font-medium">{row.currency}</td><td className="p-4">{formatMoney(row.sales, row.currency)}</td><td className="p-4">{formatMoney(row.purchases, row.currency)}</td><td className="p-4">{formatMoney(row.expenses, row.currency)}</td><td className="p-4">{formatMoney(row.cogs, row.currency)}</td><td className="p-4 font-medium">{formatMoney(row.netProfit, row.currency)}</td></tr>)}</tbody></table></div></div>}
      </>}
    </section>
  );
}
