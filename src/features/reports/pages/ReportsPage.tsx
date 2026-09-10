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
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(0, 10)
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
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

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClasses(value: string) {
  switch (value.toUpperCase()) {
    case "PAID":
    case "RECEIVED":
    case "COMPLETED":
    case "IN_STOCK":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "PARTIALLY_RECEIVED":
    case "PENDING":
    case "LOW_STOCK":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "CANCELLED":
    case "OUT_OF_STOCK":
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    case "DRAFT":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(value)}`}
    >
      {formatStatus(value)}
    </span>
  );
}

function ReportTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const tableClassName = "min-w-full divide-y divide-slate-200 text-sm";
const headClassName =
  "whitespace-nowrap bg-slate-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const cellClassName = "whitespace-nowrap px-5 py-4 text-sm text-slate-700";

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
    periodHelp:
      th
        ? "เลือกช่วงเวลาสำหรับยอดขาย การจัดซื้อ ค่าใช้จ่าย และกำไร"
        : "Choose the period used for sales, purchases, expenses and profit.",
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
    noSales:
      th
        ? "ไม่พบยอดขายที่เสร็จสิ้นในช่วงเวลาที่เลือก"
        : "No completed sales found for the selected period.",
    noPurchases:
      th
        ? "ไม่พบรายการซื้อในช่วงเวลาที่เลือก"
        : "No purchases found for the selected period.",
    noExpenses:
      th
        ? "ไม่พบค่าใช้จ่ายในช่วงเวลาที่เลือก"
        : "No expenses found for the selected period.",
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
    ? {
        tenantId: context.tenantId,
        storeId: context.storeId || undefined,
        currency: countries.TH.currency,
        dateRange,
      }
    : null;

  const { summary, loading, error } = useReports(filter);
  const primary = summary?.currencies[0];

  const cards = [
    {
      label: t("reports.salesReport"),
      value: primary ? formatMoney(primary.sales, primary.currency) : "—",
      icon: ShoppingCart,
    },
    {
      label: t("reports.purchaseReport"),
      value: primary ? formatMoney(primary.purchases, primary.currency) : "—",
      icon: Package,
    },
    {
      label: t("reports.expenseReport"),
      value: primary ? formatMoney(primary.expenses, primary.currency) : "—",
      icon: Wallet,
    },
    {
      label: t("reports.totalProfit"),
      value: primary ? formatMoney(primary.netProfit, primary.currency) : "—",
      icon: TrendingUp,
    },
    {
      label: t("reports.inventoryReport"),
      value: primary ? formatMoney(primary.inventoryValue, primary.currency) : "—",
      icon: DollarSign,
    },
  ];

  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {t("reports.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {th ? "วิเคราะห์ยอดขาย การจัดซื้อ ค่าใช้จ่าย และสินค้าคงคลัง" : "Review sales, purchases, expenses, profit and inventory performance."}
          </p>
        </div>
      </div>

      {!context?.tenantId && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {th ? "บริบทธุรกิจยังไม่ได้เริ่มต้น" : "Business context is not initialized."}
        </div>
      )}

      {context?.tenantId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">{labels.period}</h2>
              <p className="mt-1 text-sm text-slate-500">{labels.periodHelp}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", labels.all],
                ["today", labels.today],
                ["week", labels.week],
                ["month", labels.month],
                ["custom", labels.custom],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreset(value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    preset === value
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {preset === "custom" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">{th ? "จาก" : "From"}</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">{th ? "ถึง" : "To"}</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {th ? "กำลังโหลดรายงาน..." : "Loading reports..."}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && context?.tenantId && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">{card.label}</span>
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-3 text-xl font-bold text-slate-950">{card.value}</div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{labels.completedSales}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{summary?.completedSalesCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{labels.receivedPurchases}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{summary?.purchaseOrderCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{t("reports.totalExpenses")}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{summary?.expenseCount ?? 0}</p>
            </div>
          </div>

          {primary && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-950">{labels.profitLoss}</h2>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-slate-600">{t("reports.salesReport")}</span>
                  <span className="font-semibold text-slate-950">{formatMoney(primary.sales, primary.currency)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-slate-600">{labels.cogs}</span>
                  <span className="font-semibold text-slate-950">{formatMoney(primary.cogs, primary.currency)}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                  <span className="font-semibold text-slate-950">{labels.grossProfit}</span>
                  <span className="font-bold text-slate-950">{formatMoney(primary.grossProfit, primary.currency)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-slate-600">{t("reports.expenseReport")}</span>
                  <span className="font-semibold text-slate-950">{formatMoney(primary.expenses, primary.currency)}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                  <span className="font-semibold text-slate-950">{t("reports.totalProfit")}</span>
                  <span className="font-bold text-slate-950">{formatMoney(primary.netProfit, primary.currency)}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-950">{t("reports.salesReport")}</h2>
              <p className="mt-1 text-sm text-slate-500">{th ? "รายละเอียดรายการขายที่เสร็จสิ้น" : "Completed sales for the selected period."}</p>
            </div>
            {summary?.salesRows.length ? (
              <ReportTable>
                <table className={tableClassName}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={headClassName}>{labels.order}</th>
                      <th className={headClassName}>{t("common.date")}</th>
                      <th className={headClassName}>{t("sales.customer")}</th>
                      <th className={headClassName}>{t("inventory.warehouse")}</th>
                      <th className={headClassName}>{labels.items}</th>
                      <th className={`${headClassName} text-right`}>{t("common.total")}</th>
                      <th className={headClassName}>{labels.payment}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.salesRows.map((row) => (
                      <tr key={row.orderNumber} className="transition hover:bg-slate-50">
                        <td className={`${cellClassName} font-semibold text-slate-950`}>{row.orderNumber}</td>
                        <td className={cellClassName}>{formatDate(row.date)}</td>
                        <td className={cellClassName}>{row.customerName}</td>
                        <td className={cellClassName}>{row.warehouseName}</td>
                        <td className={cellClassName}>{row.itemCount}</td>
                        <td className={`${cellClassName} text-right font-semibold text-slate-950`}>{formatMoney(row.totalAmount, primary?.currency)}</td>
                        <td className={cellClassName}><StatusBadge value={row.paymentStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportTable>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{labels.noSales}</div>
            )}
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-950">{t("reports.purchaseReport")}</h2>
              <p className="mt-1 text-sm text-slate-500">{th ? "รายละเอียดใบสั่งซื้อและการรับสินค้า" : "Purchase orders and receiving activity for the selected period."}</p>
            </div>
            {summary?.purchaseRows.length ? (
              <ReportTable>
                <table className={tableClassName}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={headClassName}>{labels.purchaseOrder}</th>
                      <th className={headClassName}>{t("common.date")}</th>
                      <th className={headClassName}>{t("purchasing.supplier")}</th>
                      <th className={headClassName}>{t("inventory.warehouse")}</th>
                      <th className={`${headClassName} text-right`}>{labels.received}</th>
                      <th className={`${headClassName} text-right`}>{labels.ordered}</th>
                      <th className={`${headClassName} text-right`}>{t("common.total")}</th>
                      <th className={headClassName}>{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.purchaseRows.map((row) => (
                      <tr key={row.orderNumber} className="transition hover:bg-slate-50">
                        <td className={`${cellClassName} font-semibold text-slate-950`}>{row.orderNumber}</td>
                        <td className={cellClassName}>{formatDate(row.date)}</td>
                        <td className={cellClassName}>{row.supplierName}</td>
                        <td className={cellClassName}>{row.warehouseName}</td>
                        <td className={`${cellClassName} text-right`}>{row.receivedQuantity}</td>
                        <td className={`${cellClassName} text-right`}>{row.totalQuantity}</td>
                        <td className={`${cellClassName} text-right font-semibold text-slate-950`}>{formatMoney(row.totalAmount, row.currency)}</td>
                        <td className={cellClassName}><StatusBadge value={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportTable>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{labels.noPurchases}</div>
            )}
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-950">{t("reports.expenseReport")}</h2>
              <p className="mt-1 text-sm text-slate-500">{th ? "ค่าใช้จ่ายที่บันทึกในช่วงเวลาที่เลือก" : "Expenses recorded during the selected period."}</p>
            </div>
            {summary?.expenseRows.length ? (
              <ReportTable>
                <table className={tableClassName}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={headClassName}>{t("common.date")}</th>
                      <th className={headClassName}>{t("expenses.category")}</th>
                      <th className={headClassName}>{t("common.description")}</th>
                      <th className={`${headClassName} text-right`}>{t("expenses.amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.expenseRows.map((row, index) => (
                      <tr key={`${row.date}-${row.description}-${index}`} className="transition hover:bg-slate-50">
                        <td className={cellClassName}>{formatDate(row.date)}</td>
                        <td className={`${cellClassName} font-medium text-slate-950`}>{row.category}</td>
                        <td className={cellClassName}>{row.description}</td>
                        <td className={`${cellClassName} text-right font-semibold text-slate-950`}>{formatMoney(row.amount, row.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportTable>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{labels.noExpenses}</div>
            )}
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-slate-950">{t("reports.inventoryReport")}</h2>
              <p className="mt-1 text-sm text-slate-500">{th ? "มูลค่าและสถานะสินค้าคงคลังปัจจุบัน" : "Current inventory quantities, costs and stock status."}</p>
            </div>
            {summary?.inventoryRows.length ? (
              <ReportTable>
                <table className={tableClassName}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={headClassName}>{t("inventory.product")}</th>
                      <th className={headClassName}>{t("inventory.warehouse")}</th>
                      <th className={`${headClassName} text-right`}>{t("inventory.onHand")}</th>
                      <th className={`${headClassName} text-right`}>{t("inventory.available")}</th>
                      <th className={`${headClassName} text-right`}>{t("inventory.averageCost")}</th>
                      <th className={`${headClassName} text-right`}>{t("reports.inventoryReport")}</th>
                      <th className={headClassName}>{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.inventoryRows.map((row) => (
                      <tr key={`${row.productName}-${row.warehouseName}`} className="transition hover:bg-slate-50">
                        <td className={`${cellClassName} font-semibold text-slate-950`}>{row.productName}</td>
                        <td className={cellClassName}>{row.warehouseName}</td>
                        <td className={`${cellClassName} text-right`}>{row.quantityOnHand}</td>
                        <td className={`${cellClassName} text-right`}>{row.availableQuantity}</td>
                        <td className={`${cellClassName} text-right`}>{formatMoney(row.averageCost, primary?.currency)}</td>
                        <td className={`${cellClassName} text-right font-semibold text-slate-950`}>{formatMoney(row.inventoryValue, primary?.currency)}</td>
                        <td className={cellClassName}><StatusBadge value={row.stockStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportTable>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{labels.noInventory}</div>
            )}
          </div>

          {summary && summary.currencies.length > 1 && (
            <div>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-950">{labels.currencySummary}</h2>
              </div>
              <ReportTable>
                <table className={tableClassName}>
                  <thead className="bg-slate-50">
                    <tr>
                      <th className={headClassName}>{t("common.currency")}</th>
                      <th className={`${headClassName} text-right`}>{t("reports.salesReport")}</th>
                      <th className={`${headClassName} text-right`}>{t("reports.purchaseReport")}</th>
                      <th className={`${headClassName} text-right`}>{t("reports.expenseReport")}</th>
                      <th className={`${headClassName} text-right`}>{labels.cogs}</th>
                      <th className={`${headClassName} text-right`}>{t("reports.totalProfit")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.currencies.map((row) => (
                      <tr key={row.currency} className="transition hover:bg-slate-50">
                        <td className={`${cellClassName} font-semibold text-slate-950`}>{row.currency}</td>
                        <td className={`${cellClassName} text-right`}>{formatMoney(row.sales, row.currency)}</td>
                        <td className={`${cellClassName} text-right`}>{formatMoney(row.purchases, row.currency)}</td>
                        <td className={`${cellClassName} text-right`}>{formatMoney(row.expenses, row.currency)}</td>
                        <td className={`${cellClassName} text-right`}>{formatMoney(row.cogs, row.currency)}</td>
                        <td className={`${cellClassName} text-right font-semibold text-slate-950`}>{formatMoney(row.netProfit, row.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportTable>
            </div>
          )}
        </>
      )}
    </section>
  );
}
