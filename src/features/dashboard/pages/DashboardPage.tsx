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

function formatReference(value: string, prefix: string): string {
  const clean = value.trim();

  if (!clean) {
    return prefix;
  }

  const suffix =
    clean.split("-").filter(Boolean).pop() ?? clean;

  return `${prefix}-${suffix.slice(-6)}`;
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-red-700">
              Unable to load dashboard
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary } = data;
  const currency = data.currency;

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              {data.businessName}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Keep track of today&apos;s business activity at a glance.
            </p>
          </div>

          <Link
            to="/sales"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
          >
            <ShoppingCart size={18} />
            New Sale
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Today&apos;s Sales"
            value={formatMoney(summary.todaySales, currency)}
            icon={<CircleDollarSign size={20} />}
            description="Completed sales today"
          />

          <MetricCard
            title="Today&apos;s Profit"
            value={formatMoney(summary.todayProfit, currency)}
            icon={<CircleDollarSign size={20} />}
            description="Sales less cost of goods"
          />

          <MetricCard
            title="Today&apos;s Transactions"
            value={String(summary.todayTransactions)}
            icon={<ShoppingCart size={20} />}
            description="Completed transactions today"
          />

          <MetricCard
            title="Inventory Value"
            value={formatMoney(summary.inventoryValue, currency)}
            icon={<Boxes size={20} />}
            description="Current stock value"
          />

          <MetricCard
            title="Low Stock"
            value={String(summary.lowStockItems)}
            icon={<AlertTriangle size={20} />}
            description={
              summary.lowStockItems === 0
                ? "All stock levels look good"
                : "Products need attention"
            }
            alert={summary.lowStockItems > 0}
          />

          <MetricCard
            title="Pending Purchase Orders"
            value={String(summary.pendingPurchaseOrders)}
            icon={<Truck size={20} />}
            description="Orders awaiting receipt"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardSection
            title="Recent Sales"
            description="Latest completed sales."
          >
            <div className="divide-y divide-gray-100">
              {data.recentSales.length === 0 ? (
                <EmptyState text="No completed sales yet." />
              ) : (
                data.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatReference(sale.orderNumber, "SO")}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gray-900">
                      {formatMoney(sale.totalAmount, currency)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title="Pending Purchase Orders"
            description="Orders that still require stock receipt."
          >
            <div className="divide-y divide-gray-100">
              {data.pendingPurchaseOrders.length === 0 ? (
                <EmptyState text="No pending purchase orders." />
              ) : (
                data.pendingPurchaseOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatReference(order.orderNumber, "PO")}
                      </p>
                      <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                        {order.status === "PARTIALLY_RECEIVED"
                          ? "Partially received"
                          : "Approved"}
                      </span>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gray-900">
                      {formatMoney(order.totalAmount, order.currency)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DashboardSection>
        </div>

        <DashboardSection
          title="Inventory Alerts"
          description="Products at or below their minimum stock level."
        >
          <div className="divide-y divide-gray-100">
            {data.lowStockProducts.length === 0 ? (
              <EmptyState text="No low-stock products." />
            ) : (
              data.lowStockProducts.map((product) => (
                <div
                  key={`${product.productId}-${product.warehouseName}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {product.productName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {product.warehouseName}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-amber-600">
                      {product.quantityOnHand} remaining
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum {product.minimumStockLevel}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardSection>

        <DashboardSection
          title="Quick Actions"
          description="Common tasks you can start immediately."
        >
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              label="New Sale"
              description="Start a customer sale"
              icon={<ShoppingCart size={19} />}
              href="/sales"
              primary
            />
            <QuickAction
              label="Add Product"
              description="Add a new product"
              icon={<PackagePlus size={19} />}
              href="/products"
            />
            <QuickAction
              label="Receive Stock"
              description="Receive incoming goods"
              icon={<ArrowDownToLine size={19} />}
              href="/purchase-receiving"
            />
            <QuickAction
              label="Create Purchase Order"
              description="Order stock from a supplier"
              icon={<Truck size={19} />}
              href="/purchasing/create"
            />
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
        </h2>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
  alert = false,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            alert
              ? "bg-amber-50 text-amber-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">{description}</p>
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
      className={`group flex items-center gap-3 rounded-xl border p-4 transition ${
        primary
          ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
          : "border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:shadow"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          primary
            ? "bg-white/10 text-white"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p
          className={`mt-1 text-xs ${
            primary ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>

      <ArrowRight
        size={18}
        className={`ml-auto shrink-0 ${
          primary ? "text-gray-300" : "text-gray-400"
        }`}
      />
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-8 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}
