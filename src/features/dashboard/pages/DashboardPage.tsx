import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  PackagePlus,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useDashboard } from "../hooks/useDashboard";

function formatMoney(
  value: number,
  currency: string,
): string {
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
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const {
    data,
    loading,
    error,
  } = useDashboard();

  const {
    summary,
    currency,
    businessName,
    recentSales,
    lowStockProducts,
    pendingPurchaseOrders,
  } = data;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
          <p className="text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {businessName}
            </h1>

            <p className="mt-1 text-sm font-medium text-gray-500">
              Business overview
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Keep track of today's business activity at a glance.
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <MetricCard
            title="Today's Sales"
            value={formatMoney(
              summary.todaySales,
              currency,
            )}
            icon={<CircleDollarSign size={20} />}
            description="Completed sales today"
          />

          <MetricCard
            title="Today's Profit"
            value={formatMoney(
              summary.todayProfit,
              currency,
            )}
            icon={<ArrowUpRight size={20} />}
            description="Estimated profit today"
          />

          <MetricCard
            title="Today's Transactions"
            value={String(
              summary.todayTransactions,
            )}
            icon={<ShoppingCart size={20} />}
            description="Completed transactions"
          />

          <MetricCard
            title="Inventory Value"
            value={formatMoney(
              summary.inventoryValue,
              currency,
            )}
            icon={<Boxes size={20} />}
            description="Current stock value"
          />

          <MetricCard
            title="Low Stock"
            value={String(
              summary.lowStockItems,
            )}
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
            value={String(
              summary.pendingPurchaseOrders,
            )}
            icon={<Truck size={20} />}
            description="Orders awaiting receipt"
            alert={summary.pendingPurchaseOrders > 0}
          />
        </div>

        {/* Main Activity */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Sales */}
          <DashboardSection
            title="Recent Sales"
            description="Latest completed sales"
            actionLabel="View sales"
            actionHref="/sales"
          >
            {recentSales.length === 0 ? (
              <EmptyState text="No completed sales yet." />
            ) : (
              <div className="divide-y divide-gray-100">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {formatReference(sale.orderNumber, "SO")}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-gray-900">
                      {formatMoney(
                        sale.totalAmount,
                        currency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          {/* Purchase Orders */}
          <DashboardSection
            title="Purchase Orders"
            description="Orders awaiting receipt"
            actionLabel="View purchasing"
            actionHref="/purchasing"
          >
            {pendingPurchaseOrders.length === 0 ? (
              <EmptyState text="No purchase orders awaiting receipt." />
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingPurchaseOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {formatReference(order.orderNumber, "PO")}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          order.status === "PARTIALLY_RECEIVED"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {order.status === "PARTIALLY_RECEIVED"
                          ? "Partially received"
                          : "Approved"}
                      </span>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-gray-900">
                      {formatMoney(
                        order.totalAmount,
                        order.currency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Inventory Alert */}
        <DashboardSection
          title="Inventory Alerts"
          description="Products that need attention"
          actionLabel="View inventory"
          actionHref="/inventory"
        >
          {lowStockProducts.length === 0 ? (
            <div className="flex items-center gap-4 px-5 py-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Boxes size={19} className="text-gray-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Inventory looks healthy
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  No products are currently below their minimum stock level.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.map((product) => (
                <div
                  key={`${product.productId}-${product.warehouseName}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                      <AlertTriangle
                        size={17}
                        className="text-red-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {product.productName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {product.warehouseName}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-red-600">
                      {product.quantityOnHand} left
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Minimum {product.minimumStockLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>

        {/* Quick Actions */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Common tasks you can start immediately.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

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
            /></div>
        </div>

      </div>
    </div>
  );
}

function formatReference(
  value: string,
  prefix: string,
): string {
  const clean = value.trim();

  if (!clean) {
    return prefix;
  }

  const suffix = clean
    .split("-")
    .filter(Boolean)
    .pop() ?? clean;

  const compact = suffix.slice(-6);

  return `${prefix}-${compact}`;
}
function DashboardSection({
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        {actionLabel && actionHref && (
          <Link
            to={actionHref}
            className="shrink-0 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            {actionLabel} <ArrowRight size={14} />
          </Link>
        )}
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
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

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

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Activity size={18} className="text-gray-500" />
      </div>

      <p className="text-sm text-gray-500">
        {text}
      </p>
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
        <p className="text-sm font-semibold">
          {label}
        </p>

        <p
          className={`mt-1 text-xs ${
            primary
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>

      <span
        className={`ml-auto text-lg transition-transform group-hover:translate-x-0.5 ${
          primary
            ? "text-gray-300"
            : "text-gray-400"
        }`}
      >
        ?
      </span>
    </Link>
  );
}




