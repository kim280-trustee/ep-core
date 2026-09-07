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
      <div className="space-y-5">
        <div className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">{today}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {getGreeting()}, {data.businessName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Here&apos;s what&apos;s happening in your store today.
            </p>
          </div>
          <Link
            to="/sales"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            <ShoppingCart size={18} />
            New Sale
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <AttentionCard
          title="Low Stock"
          value={summary.lowStockItems}
          description={
            summary.lowStockItems === 0
              ? "All stock levels look good"
              : "Products need attention"
          }
          icon={<AlertTriangle size={22} />}
          href="#inventory-alerts"
          alert={summary.lowStockItems > 0}
        />
        <AttentionCard
          title="Pending Purchase Orders"
          value={summary.pendingPurchaseOrders}
          description="Orders awaiting receipt"
          icon={<Truck size={22} />}
          href="#pending-orders"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardSection
          title="Recent Sales"
          description="Your latest completed transactions"
          actionLabel="View sales"
          actionHref="/sales"
        >
          {data.recentSales.length === 0 ? (
            <EmptyState text="No completed sales yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between gap-4 px-5 py-4">
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
          title="Pending Purchase Orders"
          description="Orders that still require stock receipt"
          actionLabel="View purchasing"
          actionHref="/purchasing"
          id="pending-orders"
        >
          {data.pendingPurchaseOrders.length === 0 ? (
            <EmptyState text="No pending purchase orders." />
          ) : (
            <div className="divide-y divide-slate-100">
              {data.pendingPurchaseOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4">
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
            <div className="flex items-center gap-3 px-5 py-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Boxes size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Stock levels look healthy</p>
                <p className="mt-1 text-xs text-slate-500">No products are currently below their minimum level.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.lowStockProducts.map((product) => (
                <div key={`${product.productId}-${product.warehouseName}`} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{product.productName}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.warehouseName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:text-right">
                    <div>
                      <p className="text-xs text-slate-500">Current</p>
                      <p className="mt-1 text-sm font-bold text-amber-600">{product.quantityOnHand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Minimum</p>
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
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Quick actions</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Get things done</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction label="New Sale" description="Start a customer sale" icon={<ShoppingCart size={19} />} href="/sales" primary />
          <QuickAction label="Add Product" description="Add a new product" icon={<PackagePlus size={19} />} href="/products" />
          <QuickAction label="Receive Stock" description="Receive incoming goods" icon={<ArrowDownToLine size={19} />} href="/purchase-receiving" />
          <QuickAction label="Create Purchase Order" description="Order stock from a supplier" icon={<Truck size={19} />} href="/purchasing/create" />
        </div>
      </section>
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
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
  icon,
  href,
  alert = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  href: string;
  alert?: boolean;
}) {
  return (
    <a
      href={href}
      className={`group flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
        alert ? "border-amber-200 hover:border-amber-300" : "border-slate-200 hover:border-blue-200"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${alert ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${alert ? "text-amber-600" : "text-slate-900"}`}>{value}</span>
        <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1" />
      </div>
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
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        {actionLabel && actionHref && (
          <Link to={actionHref} className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:inline-flex">
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
      className={`group flex min-h-[92px] items-center gap-3 rounded-2xl border p-4 transition ${
        primary
          ? "border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${primary ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className={`mt-1 text-xs ${primary ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
      </div>
      <ArrowRight size={18} className={`ml-auto shrink-0 transition group-hover:translate-x-1 ${primary ? "text-slate-300" : "text-slate-400"}`} />
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-5 py-10 text-center text-sm text-slate-500">{text}</div>;
}
