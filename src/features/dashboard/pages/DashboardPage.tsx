import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  PackagePlus,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useDashboard } from "../hooks/useDashboard";
import { useTranslation } from "../../../core/i18n/useTranslation";

function formatMoney(value: number, currency = "THB"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatReference(value: string, prefix: string): string {
  const clean = value.trim();
  if (!clean) return prefix;
  const suffix = clean.split("-").filter(Boolean).pop() ?? clean;
  return `${prefix}-${suffix.slice(-6)}`;
}

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.goodMorning");
  if (hour < 18) return t("dashboard.goodAfternoon");
  return t("dashboard.goodEvening");
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-3xl bg-slate-900" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="font-semibold text-red-700">
          {t("dashboard.unableToLoad")}
        </p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const currency = data.currency;
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="-mx-4 -my-6 min-h-full bg-slate-100 px-4 py-6 pb-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-24 h-32 w-32 translate-y-1/2 rounded-full bg-white/[0.03]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("dashboard.storeOverview")}
              </div>

              <p className="text-sm font-medium text-slate-400">{today}</p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {getGreeting(t)}, {data.businessName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                {t("dashboard.storeTodayDescription")}
              </p>
            </div>

            <Link
              to="/sales"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-slate-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <ShoppingCart size={18} />
              {t("dashboard.newSale")}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow={t("dashboard.todayAtAGlance")}
            title={t("dashboard.businessPerformance")}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title={t("dashboard.todaySales")}
              value={formatMoney(summary.todaySales, currency)}
              icon={<CircleDollarSign size={21} />}
              tone="blue"
              detail={t("dashboard.completedSalesToday")}
            />

            <MetricCard
              title={t("dashboard.todayProfit")}
              value={formatMoney(summary.todayProfit, currency)}
              icon={<CircleDollarSign size={21} />}
              tone="green"
              detail={t("dashboard.salesLessCost")}
            />

            <MetricCard
              title={t("dashboard.transactions")}
              value={String(summary.todayTransactions)}
              icon={<ShoppingCart size={21} />}
              tone="purple"
              detail={t("dashboard.completedToday")}
            />

            <MetricCard
              title={t("dashboard.inventoryValue")}
              value={formatMoney(summary.inventoryValue, currency)}
              icon={<Boxes size={21} />}
              tone="orange"
              detail={t("dashboard.currentStockValue")}
            />
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow={t("dashboard.actionCenter")}
            title={t("dashboard.needsYourAttention")}
            description={t("dashboard.needsAttentionDescription")}
          />

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <AttentionCard
              title={t("dashboard.lowStock")}
              value={summary.lowStockItems}
              description={
                summary.lowStockItems === 0
                  ? t("dashboard.allStockLevelsGood")
                  : t("dashboard.productsNeedAttention")
              }
              actionLabel={t("dashboard.viewInventory")}
              icon={<AlertTriangle size={22} />}
              href="#inventory-alerts"
              alert={summary.lowStockItems > 0}
            />

            <AttentionCard
              title={t("dashboard.pendingPurchaseOrders")}
              value={summary.pendingPurchaseOrders}
              description={t("dashboard.ordersAwaitingReceipt")}
              actionLabel={t("dashboard.viewPurchasing")}
              icon={<Truck size={22} />}
              href="#pending-orders"
            />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <DashboardSection
            title={t("dashboard.recentSales")}
            description={t("dashboard.latestCompletedTransactions")}
            actionLabel={t("dashboard.viewSales")}
            actionHref="/sales"
          >
            {data.recentSales.length === 0 ? (
              <EmptyState
                icon={<ShoppingCart size={20} />}
                title={t("dashboard.noCompletedSales")}
                text={t("dashboard.startFirstSaleDescription")}
                actionLabel={t("dashboard.startSale")}
                actionHref="/sales"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ShoppingCart size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {formatReference(sale.orderNumber, "SO")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-900">
                      {formatMoney(sale.totalAmount, currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title={t("dashboard.pendingPurchaseOrders")}
            description={t("dashboard.ordersRequireReceipt")}
            actionLabel={t("dashboard.viewPurchasing")}
            actionHref="/purchasing"
            id="pending-orders"
          >
            {data.pendingPurchaseOrders.length === 0 ? (
              <EmptyState
                icon={<Truck size={20} />}
                title={t("dashboard.noPendingPurchaseOrders")}
                text={t("dashboard.noApprovedOrdersWaiting")}
                actionLabel={t("dashboard.viewPurchasing")}
                actionHref="/purchasing"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {data.pendingPurchaseOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <Truck size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {formatReference(order.orderNumber, "PO")}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {order.status === "PARTIALLY_RECEIVED"
                            ? t("dashboard.partiallyReceived")
                            : t("dashboard.approved")}
                        </span>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-900">
                      {formatMoney(order.totalAmount, order.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </section>

        <section id="inventory-alerts">
          <DashboardSection
            title={t("dashboard.inventoryAlerts")}
            description={t("dashboard.productsAtMinimum")}
            actionLabel={t("dashboard.viewInventory")}
            actionHref="/inventory"
          >
            {data.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:flex-row sm:text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Boxes size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {t("dashboard.stockLevelsHealthy")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t("dashboard.noProductsBelowMinimum")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={`${product.productId}-${product.warehouseName}`}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <AlertTriangle size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {product.productName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.warehouseName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 sm:text-right">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          {t("dashboard.current")}
                        </p>
                        <p className="mt-1 text-sm font-bold text-amber-600">
                          {product.quantityOnHand}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          {t("dashboard.minimum")}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {product.minimumStockLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </section>

        <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:p-6">
          <SectionHeading
            eyebrow={t("dashboard.quickActions")}
            title={t("dashboard.getThingsDone")}
            description={t("dashboard.quickActionsDescription")}
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              label={t("dashboard.newSale")}
              description={t("dashboard.startCustomerSale")}
              icon={<ShoppingCart size={20} />}
              href="/sales"
              primary
            />

            <QuickAction
              label={t("dashboard.addProduct")}
              description={t("dashboard.addNewProduct")}
              icon={<PackagePlus size={20} />}
              href="/products"
            />

            <QuickAction
              label={t("dashboard.receiveStock")}
              description={t("dashboard.receiveIncomingGoods")}
              icon={<ArrowDownToLine size={20} />}
              href="/purchase-receiving"
            />

            <QuickAction
              label={t("dashboard.createPurchaseOrder")}
              description={t("dashboard.orderStockSupplier")}
              icon={<Truck size={20} />}
              href="/purchasing/create"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  tone,
  detail,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tone: "blue" | "green" | "purple" | "orange";
  detail: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function AttentionCard({
  title,
  value,
  description,
  actionLabel,
  icon,
  href,
  alert = false,
}: {
  title: string;
  value: number;
  description: string;
  actionLabel: string;
  icon: ReactNode;
  href: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${alert ? "text-amber-600" : "text-slate-950"}`}>
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          {icon}
        </div>
      </div>
      <a href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
        {actionLabel}
        <ArrowRight size={15} />
      </a>
    </div>
  );
}

function DashboardSection({
  title,
  description,
  actionLabel,
  actionHref,
  id,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <Link to={actionHref} className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700">
          {actionLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  actionLabel,
  actionHref,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <p className="mt-4 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{text}</p>
      <Link to={actionHref} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
        {actionLabel}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function QuickAction({
  label,
  description,
  icon,
  href,
  primary = false,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={href}
      className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
        primary
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            primary ? "bg-white/15" : "bg-slate-100 text-slate-700"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">{label}</p>
          <p className={`mt-1 text-xs leading-5 ${primary ? "text-blue-100" : "text-slate-500"}`}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
