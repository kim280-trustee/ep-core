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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

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
        <p className="font-semibold text-red-700">Unable to load dashboard</p>
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
    <div className="space-y-8 pb-4">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-24 h-32 w-32 translate-y-1/2 rounded-full bg-white/[0.03]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Store overview
            </div>
            <p className="text-sm font-medium text-slate-400">{today}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {getGreeting()}, {data.businessName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Here&apos;s what&apos;s happening in your store today. Monitor performance, handle what needs attention, and keep business moving.
            </p>
          </div>

          <Link
            to="/sales"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-slate-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            <ShoppingCart size={18} />
            New Sale
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Today at a glance" title="Business performance" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Today&apos;s Sales"
            value={formatMoney(summary.todaySales, currency)}
            icon={<CircleDollarSign size={21} />}
            tone="blue"
            detail="Completed sales today"
          />
          <MetricCard
            title="Today&apos;s Profit"
            value={formatMoney(summary.todayProfit, currency)}
            icon={<CircleDollarSign size={21} />}
            tone="green"
            detail="Sales less cost of goods"
          />
          <MetricCard
            title="Transactions"
            value={String(summary.todayTransactions)}
            icon={<ShoppingCart size={21} />}
            tone="purple"
            detail="Completed today"
          />
          <MetricCard
            title="Inventory Value"
            value={formatMoney(summary.inventoryValue, currency)}
            icon={<Boxes size={21} />}
            tone="orange"
            detail="Current stock value"
          />
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Action center"
          title="Needs your attention"
          description="Start with the items that need action in your store."
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AttentionCard
            title="Low Stock"
            value={summary.lowStockItems}
            description={
              summary.lowStockItems === 0
                ? "All stock levels look good"
                : "Products need attention"
            }
            actionLabel="View inventory"
            icon={<AlertTriangle size={22} />}
            href="#inventory-alerts"
            alert={summary.lowStockItems > 0}
          />
          <AttentionCard
            title="Pending Purchase Orders"
            value={summary.pendingPurchaseOrders}
            description="Orders awaiting receipt"
            actionLabel="View purchasing"
            icon={<Truck size={22} />}
            href="#pending-orders"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardSection
          title="Recent Sales"
          description="Your latest completed transactions"
          actionLabel="View sales"
          actionHref="/sales"
        >
          {data.recentSales.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart size={20} />}
              title="No completed sales yet"
              text="Start your first sale to see today&apos;s activity here."
              actionLabel="Start a sale"
              actionHref="/sales"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ShoppingCart size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {formatReference(sale.orderNumber, "SO")}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(sale.createdAt)}</p>
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
          title="Pending Purchase Orders"
          description="Orders that still require stock receipt"
          actionLabel="View purchasing"
          actionHref="/purchasing"
          id="pending-orders"
        >
          {data.pendingPurchaseOrders.length === 0 ? (
            <EmptyState
              icon={<Truck size={20} />}
              title="No pending purchase orders"
              text="There are no approved orders waiting for receipt."
              actionLabel="View purchasing"
              actionHref="/purchasing"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.pendingPurchaseOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Truck size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {formatReference(order.orderNumber, "PO")}
                      </p>
                      <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {order.status === "PARTIALLY_RECEIVED" ? "Partially received" : "Approved"}
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
          title="Inventory Alerts"
          description="Products at or below their minimum stock level"
          actionLabel="View inventory"
          actionHref="/inventory"
        >
          {data.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Boxes size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Stock levels look healthy</p>
                <p className="mt-1 text-xs text-slate-500">No products are currently below their minimum level.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.lowStockProducts.map((product) => (
                <div key={`${product.productId}-${product.warehouseName}`} className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.productName}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.warehouseName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 sm:text-right">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Current</p>
                      <p className="mt-1 text-sm font-bold text-amber-600">{product.quantityOnHand}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Minimum</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">{product.minimumStockLevel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </section>

      <section>
        <SectionHeading eyebrow="Quick actions" title="Get things done" description="Start the task you need without searching through the menu." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            label="New Sale"
            description="Start a customer sale"
            icon={<ShoppingCart size={20} />}
            href="/sales"
            primary
          />
          <QuickAction
            label="Add Product"
            description="Add a new product"
            icon={<PackagePlus size={20} />}
            href="/products"
          />
          <QuickAction
            label="Receive Stock"
            description="Receive incoming goods"
            icon={<ArrowDownToLine size={20} />}
            href="/purchase-receiving"
          />
          <QuickAction
            label="Create Purchase Order"
            description="Order stock from a supplier"
            icon={<Truck size={20} />}
            href="/purchasing/create"
          />
        </div>
      </section>
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
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
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
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{detail}</p>
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
    <a
      href={href}
      className={`group flex min-h-28 items-center justify-between gap-5 rounded-2xl border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        alert ? "border-amber-200 hover:border-amber-300" : "border-slate-200 hover:border-blue-200"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${alert ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
            {actionLabel}
            <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <span className={`shrink-0 text-3xl font-bold tracking-tight ${alert ? "text-amber-600" : "text-slate-950"}`}>{value}</span>
    </a>
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
  actionLabel?: string;
  actionHref?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        {actionLabel && actionHref && (
          <Link to={actionHref} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700">
            {actionLabel}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
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
      className={`group flex min-h-24 items-center gap-4 rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
        primary
          ? "border-slate-950 bg-slate-950 text-white shadow-md hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300"
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${primary ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className={`mt-1 text-xs ${primary ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
      </div>
      <ArrowRight size={18} className={`shrink-0 transition duration-200 group-hover:translate-x-1 ${primary ? "text-slate-300" : "text-slate-400"}`} />
    </Link>
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
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-9 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{text}</p>
      {actionLabel && actionHref && (
        <Link to={actionHref} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
          {actionLabel}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
