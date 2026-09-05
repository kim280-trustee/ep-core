/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Module
 *
 * Inventory History
 * ============================================================
 */

import { useMemo } from "react";

import {
  useInventoryLedger,
} from "@/features/inventory-ledger/hooks/useInventoryLedger";

import type {
  InventoryLedgerEntry,
} from "@/features/inventory-ledger/types/inventory-ledger.types";


function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}


function formatMovementType(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}


function formatNumber(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}


function isIncomingMovement(
  movementType: string,
): boolean {
  return [
    "INITIAL_STOCK",
    "PURCHASE_RECEIPT",
    "SALE_RETURN",
    "TRANSFER_IN",
    "ADJUSTMENT_IN",
  ].includes(movementType);
}


function isOutgoingMovement(
  movementType: string,
): boolean {
  return [
    "SALE",
    "PURCHASE_RETURN",
    "TRANSFER_OUT",
    "ADJUSTMENT_OUT",
  ].includes(movementType);
}


export function InventoryHistoryPage() {

  const {
    ledger,
    loading,
    error,
    refresh,
  } = useInventoryLedger();


  const summary = useMemo(() => {

    let totalIn = 0;
    let totalOut = 0;
    let transactionValue = 0;

    for (const transaction of ledger) {

      const quantity =
        Math.abs(transaction.quantity);

      if (
        isIncomingMovement(
          transaction.movementType,
        )
      ) {
        totalIn += quantity;
      } else if (
        isOutgoingMovement(
          transaction.movementType,
        )
      ) {
        totalOut += quantity;
      }

      transactionValue +=
        quantity *
        transaction.unitCost;
    }

    return {
      totalTransactions: ledger.length,
      totalIn,
      totalOut,
      transactionValue,
    };

  }, [ledger]);


  return (
    <div className="space-y-6 p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Inventory History
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Complete inventory movement history.
          </p>

        </div>


        <button
          type="button"
          onClick={() => {
            void refresh();
          }}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            Transactions
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(
              summary.totalTransactions,
            )}
          </p>

        </div>


        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            Stock In
          </p>

          <p className="mt-2 text-2xl font-semibold text-green-700">
            {formatNumber(
              summary.totalIn,
            )}
          </p>

        </div>


        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            Stock Out
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-700">
            {formatNumber(
              summary.totalOut,
            )}
          </p>

        </div>


        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

          <p className="text-sm text-gray-500">
            Movement Value
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(
              summary.transactionValue,
            )}
          </p>

        </div>

      </div>


      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Movement
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Quantity
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Unit Cost
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Value
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Warehouse
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Reference
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-200 bg-white">

              {loading && ledger.length === 0 && (
                <tr>

                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    Loading inventory history...
                  </td>

                </tr>
              )}


              {!loading &&
                !error &&
                ledger.length === 0 && (
                  <tr>

                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No inventory movements found.
                    </td>

                  </tr>
                )}


              {ledger.map(
                (
                  transaction: InventoryLedgerEntry,
                ) => {

                  const quantity =
                    Math.abs(
                      transaction.quantity,
                    );

                  const value =
                    quantity *
                    transaction.unitCost;

                  const isIncoming =
                    isIncomingMovement(
                      transaction.movementType,
                    );

                  const isOutgoing =
                    isOutgoingMovement(
                      transaction.movementType,
                    );

                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {formatDate(
                          transaction.createdAt,
                        )}
                      </td>


                      <td className="px-4 py-3">

                        <div className="max-w-xs">

                          <p className="truncate font-medium text-gray-900">
                            {transaction.productId}
                          </p>

                          

                        </div>

                      </td>


                      <td className="whitespace-nowrap px-4 py-3">

                        <span
                          className={
                            isIncoming
                              ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : isOutgoing
                                ? "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                                : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                          }
                        >
                          {formatMovementType(
                            transaction.movementType,
                          )}
                        </span>

                      </td>


                      <td
                        className={
                          isIncoming
                            ? "whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-green-700"
                            : isOutgoing
                              ? "whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-red-700"
                              : "whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-700"
                        }
                      >
                        {isIncoming
                          ? "+"
                          : isOutgoing
                            ? "-"
                            : ""}

                        {formatNumber(
                          quantity,
                        )}

                      </td>


                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">
                        {formatNumber(
                          transaction.unitCost,
                        )}
                      </td>


                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatNumber(
                          value,
                        )}
                      </td>


                      <td className="px-4 py-3">

                        <div className="max-w-xs">

                          <p className="truncate font-medium text-gray-900">
                            {transaction.warehouseId}
                          </p>

                          

                        </div>

                      </td>


                      <td className="px-4 py-3 text-sm text-gray-600">

                        <div>

                          <p>
                            {transaction.referenceType
                              ? formatMovementType(
                                  transaction.referenceType,
                                )
                              : "-"}
                          </p>

                          {transaction.referenceId && (
                            <p className="max-w-48 truncate text-xs text-gray-400">
                              {transaction.referenceId}
                            </p>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}



