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
import type {
  ReportDateRange,
  ReportFilter,
} from "../types";
import { storeContext } from "@/core/store/store.context";
import { countries } from "@/core/config/country.config";

function formatMoney(
  value: number,
  currency?: string,
) {
  if (!currency) {
    return value.toLocaleString();
  }

  return `${currency} ${value.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString();
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPresetRange(
  preset: string,
): ReportDateRange | undefined {
  const today = new Date();

  if (preset === "all") {
    return undefined;
  }

  if (preset === "today") {
    const value =
      formatDateInput(today);

    return {
      from: value,
      to: value,
    };
  }

  if (preset === "week") {
    const day = today.getDay();
    const difference =
      day === 0 ? -6 : 1 - day;

    const start = new Date(today);

    start.setDate(
      today.getDate() +
        difference,
    );

    return {
      from:
        formatDateInput(start),
      to:
        formatDateInput(today),
    };
  }

  if (preset === "month") {
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    return {
      from:
        formatDateInput(start),
      to:
        formatDateInput(today),
    };
  }

  return undefined;
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium">
      {value.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

export function ReportsPage() {
  const context =
    storeContext.getStore();

  const [preset, setPreset] =
    useState("all");

  const [customFrom, setCustomFrom] =
    useState("");

  const [customTo, setCustomTo] =
    useState("");

  const dateRange =
    useMemo<
      ReportDateRange | undefined
    >(() => {
      if (preset === "custom") {
        if (
          !customFrom &&
          !customTo
        ) {
          return undefined;
        }

        return {
          from:
            customFrom ||
            undefined,
          to:
            customTo ||
            undefined,
        };
      }

      return getPresetRange(
        preset,
      );
    }, [
      preset,
      customFrom,
      customTo,
    ]);

  const filter:
    ReportFilter | null =
    context?.tenantId
      ? {
          tenantId:
            context.tenantId,

          storeId:
            context.storeId ||
            undefined,

          currency:
            countries.TH.currency,

          dateRange,
        }
      : null;

  const {
    summary,
    loading,
    error,
  } = useReports(filter);

  const primary =
    summary?.currencies[0];

  const cards = [
    {
      label: "Sales",
      value: primary
        ? formatMoney(
            primary.sales,
            primary.currency,
          )
        : "—",
      icon: ShoppingCart,
    },
    {
      label: "Purchases",
      value: primary
        ? formatMoney(
            primary.purchases,
            primary.currency,
          )
        : "—",
      icon: Package,
    },
    {
      label: "Expenses",
      value: primary
        ? formatMoney(
            primary.expenses,
            primary.currency,
          )
        : "—",
      icon: Wallet,
    },
    {
      label: "Net Profit",
      value: primary
        ? formatMoney(
            primary.netProfit,
            primary.currency,
          )
        : "—",
      icon: TrendingUp,
    },
    {
      label: "Inventory Value",
      value: primary
        ? formatMoney(
            primary.inventoryValue,
            primary.currency,
          )
        : "—",
      icon: DollarSign,
    },
  ];

  return (
    <section className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7" />

          <h1 className="text-2xl font-semibold">
            Reports
          </h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Business performance across sales, purchasing, expenses and inventory.
        </p>
      </div>

      {!context?.tenantId && (
        <div className="rounded-lg border p-6 text-sm text-red-600">
          Tenant context is not initialized.
        </div>
      )}

      {context?.tenantId && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-semibold">
                Report Period
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose the period used for sales, purchases, expenses and profit. Inventory is always the current stock position.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All time"],
                ["today", "Today"],
                ["week", "This week"],
                ["month", "This month"],
                ["custom", "Custom"],
              ].map(
                ([
                  value,
                  label,
                ]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setPreset(
                        value,
                      )
                    }
                    className={`rounded-md border px-3 py-2 text-sm ${
                      preset === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background"
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          {preset ===
            "custom" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">
                  From
                </span>

                <input
                  type="date"
                  value={
                    customFrom
                  }
                  onChange={(
                    event,
                  ) =>
                    setCustomFrom(
                      event.target
                        .value,
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">
                  To
                </span>

                <input
                  type="date"
                  value={
                    customTo
                  }
                  onChange={(
                    event,
                  ) =>
                    setCustomTo(
                      event.target
                        .value,
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border p-6 text-sm">
          Loading reports...
        </div>
      )}

      {error && (
        <div className="rounded-lg border p-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        context?.tenantId && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {cards.map(
                (card) => {
                  const Icon =
                    card.icon;

                  return (
                    <div
                      key={
                        card.label
                      }
                      className="rounded-xl border bg-card p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {
                            card.label
                          }
                        </span>

                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="mt-3 text-xl font-semibold">
                        {
                          card.value
                        }
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Completed Sales
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {
                    summary?.completedSalesCount ??
                    0
                  }
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Received Purchases
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {
                    summary?.purchaseOrderCount ??
                    0
                  }
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Expenses
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {
                    summary?.expenseCount ??
                    0
                  }
                </p>
              </div>
            </div>

            {primary && (
              <div className="rounded-xl border">
                <div className="border-b p-5">
                  <h2 className="font-semibold">
                    Profit & Loss
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Financial performance for the selected reporting period.
                  </p>
                </div>

                <div className="divide-y">
                  <div className="flex items-center justify-between p-5">
                    <span>
                      Sales
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        primary.sales,
                        primary.currency,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-5">
                    <span>
                      Cost of Goods Sold
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        primary.cogs,
                        primary.currency,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-muted/30 p-5">
                    <span className="font-semibold">
                      Gross Profit
                    </span>

                    <span className="font-semibold">
                      {formatMoney(
                        primary.grossProfit,
                        primary.currency,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-5">
                    <span>
                      Expenses
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        primary.expenses,
                        primary.currency,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-muted/30 p-5">
                    <span className="font-semibold">
                      Net Profit
                    </span>

                    <span className="font-semibold">
                      {formatMoney(
                        primary.netProfit,
                        primary.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border">
              <div className="border-b p-5">
                <h2 className="font-semibold">
                  Sales Report
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Completed sales for the selected period.
                </p>
              </div>

              {summary?.salesRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-4">
                          Order
                        </th>
                        <th className="p-4">
                          Date
                        </th>
                        <th className="p-4">
                          Customer
                        </th>
                        <th className="p-4">
                          Warehouse
                        </th>
                        <th className="p-4">
                          Items
                        </th>
                        <th className="p-4">
                          Total
                        </th>
                        <th className="p-4">
                          Payment
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {summary.salesRows.map(
                        (row) => (
                          <tr
                            key={
                              row.orderNumber
                            }
                            className="border-b last:border-0"
                          >
                            <td className="p-4 font-medium">
                              {
                                row.orderNumber
                              }
                            </td>

                            <td className="p-4">
                              {formatDate(
                                row.date,
                              )}
                            </td>

                            <td className="p-4">
                              {
                                row.customerName
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.warehouseName
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.itemCount
                              }
                            </td>

                            <td className="p-4 font-medium">
                              {formatMoney(
                                row.totalAmount,
                                primary?.currency,
                              )}
                            </td>

                            <td className="p-4">
                              <StatusBadge
                                value={
                                  row.paymentStatus
                                }
                              />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No completed sales found for the selected period.
                </div>
              )}
            </div>

            <div className="rounded-xl border">
              <div className="border-b p-5">
                <h2 className="font-semibold">
                  Purchasing Report
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Received and partially received purchase orders.
                </p>
              </div>

              {summary?.purchaseRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-4">
                          Purchase Order
                        </th>
                        <th className="p-4">
                          Date
                        </th>
                        <th className="p-4">
                          Supplier
                        </th>
                        <th className="p-4">
                          Warehouse
                        </th>
                        <th className="p-4">
                          Received
                        </th>
                        <th className="p-4">
                          Ordered
                        </th>
                        <th className="p-4">
                          Total
                        </th>
                        <th className="p-4">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {summary.purchaseRows.map(
                        (row) => (
                          <tr
                            key={
                              row.orderNumber
                            }
                            className="border-b last:border-0"
                          >
                            <td className="p-4 font-medium">
                              {
                                row.orderNumber
                              }
                            </td>

                            <td className="p-4">
                              {formatDate(
                                row.date,
                              )}
                            </td>

                            <td className="p-4">
                              {
                                row.supplierName
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.warehouseName
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.receivedQuantity
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.totalQuantity
                              }
                            </td>

                            <td className="p-4 font-medium">
                              {formatMoney(
                                row.totalAmount,
                                row.currency,
                              )}
                            </td>

                            <td className="p-4">
                              <StatusBadge
                                value={
                                  row.status
                                }
                              />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No received purchases found for the selected period.
                </div>
              )}
            </div>

            <div className="rounded-xl border">
              <div className="border-b p-5">
                <h2 className="font-semibold">
                  Expense Report
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Expenses recorded for the selected period.
                </p>
              </div>

              {summary?.expenseRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-4">
                          Date
                        </th>
                        <th className="p-4">
                          Category
                        </th>
                        <th className="p-4">
                          Description
                        </th>
                        <th className="p-4">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {summary.expenseRows.map(
                        (
                          row,
                          index,
                        ) => (
                          <tr
                            key={`${row.date}-${row.description}-${index}`}
                            className="border-b last:border-0"
                          >
                            <td className="p-4">
                              {formatDate(
                                row.date,
                              )}
                            </td>

                            <td className="p-4">
                              {
                                row.category
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.description
                              }
                            </td>

                            <td className="p-4 font-medium">
                              {formatMoney(
                                row.amount,
                                row.currency,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No expenses found for the selected period.
                </div>
              )}
            </div>

            <div className="rounded-xl border">
              <div className="border-b p-5">
                <h2 className="font-semibold">
                  Inventory Report
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Current inventory position. The report period does not change this current stock snapshot.
                </p>
              </div>

              {summary?.inventoryRows.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-4">
                          Product
                        </th>
                        <th className="p-4">
                          Warehouse
                        </th>
                        <th className="p-4">
                          On Hand
                        </th>
                        <th className="p-4">
                          Available
                        </th>
                        <th className="p-4">
                          Average Cost
                        </th>
                        <th className="p-4">
                          Inventory Value
                        </th>
                        <th className="p-4">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {summary.inventoryRows.map(
                        (row) => (
                          <tr
                            key={`${row.productName}-${row.warehouseName}`}
                            className="border-b last:border-0"
                          >
                            <td className="p-4 font-medium">
                              {
                                row.productName
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.warehouseName
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.quantityOnHand
                              }
                            </td>

                            <td className="p-4">
                              {
                                row.availableQuantity
                              }
                            </td>

                            <td className="p-4">
                              {formatMoney(
                                row.averageCost,
                                primary?.currency,
                              )}
                            </td>

                            <td className="p-4 font-medium">
                              {formatMoney(
                                row.inventoryValue,
                                primary?.currency,
                              )}
                            </td>

                            <td className="p-4">
                              <StatusBadge
                                value={
                                  row.stockStatus
                                }
                              />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No inventory records found for the selected warehouse.
                </div>
              )}
            </div>

            {summary &&
              summary.currencies.length >
                1 && (
                <div className="rounded-xl border">
                  <div className="border-b p-5">
                    <h2 className="font-semibold">
                      Currency Summary
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-4">
                            Currency
                          </th>
                          <th className="p-4">
                            Sales
                          </th>
                          <th className="p-4">
                            Purchases
                          </th>
                          <th className="p-4">
                            Expenses
                          </th>
                          <th className="p-4">
                            COGS
                          </th>
                          <th className="p-4">
                            Net Profit
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {summary.currencies.map(
                          (row) => (
                            <tr
                              key={
                                row.currency
                              }
                              className="border-b last:border-0"
                            >
                              <td className="p-4 font-medium">
                                {
                                  row.currency
                                }
                              </td>

                              <td className="p-4">
                                {formatMoney(
                                  row.sales,
                                  row.currency,
                                )}
                              </td>

                              <td className="p-4">
                                {formatMoney(
                                  row.purchases,
                                  row.currency,
                                )}
                              </td>

                              <td className="p-4">
                                {formatMoney(
                                  row.expenses,
                                  row.currency,
                                )}
                              </td>

                              <td className="p-4">
                                {formatMoney(
                                  row.cogs,
                                  row.currency,
                                )}
                              </td>

                              <td className="p-4 font-medium">
                                {formatMoney(
                                  row.netProfit,
                                  row.currency,
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </>
        )}
    </section>
  );
}
