import {
  RefreshCw,
} from "lucide-react";

import {
  useInventoryLedger,
} from "../hooks/useInventoryLedger";


function formatMovement(
  movementType: string,
): string {

  return movementType
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );

}


export function InventoryLedgerPage() {

  const {
    ledger,
    loading,
    error,
    refresh,
  } = useInventoryLedger();


  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Inventory Ledger
          </h1>

          <p className="text-sm text-muted-foreground">
            View all inventory movements and stock history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={
              loading
                ? "h-4 w-4 animate-spin"
                : "h-4 w-4"
            }
          />

          Refresh
        </button>

      </div>


      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="overflow-hidden rounded-lg border bg-background">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="border-b bg-muted/50">

              <tr>

                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Date
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Product
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Warehouse
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Movement
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right">
                  Quantity
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right">
                  Unit Cost
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Reference
                </th>

              </tr>

            </thead>


            <tbody>

              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Loading inventory ledger...
                  </td>
                </tr>
              )}


              {!loading &&
                !error &&
                ledger.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No inventory movements found.
                    </td>
                  </tr>
                )}


              {!loading &&
                ledger.map((entry) => (

                  <tr
                    key={entry.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >

                    <td className="whitespace-nowrap px-4 py-3">
                      {new Date(
                        entry.createdAt,
                      ).toLocaleString()}
                    </td>


                    <td className="px-4 py-3">

                      <div className="font-medium">
                        {entry.productName ??
                          entry.productId}
                      </div>

                      {entry.productName && (
                        <div className="text-xs text-muted-foreground">
                          {entry.productId}
                        </div>
                      )}

                    </td>


                    <td className="px-4 py-3">

                      <div className="font-medium">
                        {entry.warehouseName ??
                          entry.warehouseId}
                      </div>

                      {entry.warehouseName && (
                        <div className="text-xs text-muted-foreground">
                          {entry.warehouseId}
                        </div>
                      )}

                    </td>


                    <td className="whitespace-nowrap px-4 py-3">
                      {formatMovement(
                        entry.movementType,
                      )}
                    </td>


                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {entry.quantity}
                    </td>


                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {entry.unitCost.toFixed(2)}
                    </td>


                    <td className="px-4 py-3">

                      <div>
                        {entry.referenceType
                          ? formatMovement(
                              entry.referenceType,
                            )
                          : "-"}
                      </div>

                      {entry.referenceId && (
                        <div className="max-w-48 truncate text-xs text-muted-foreground">
                          {entry.referenceId}
                        </div>
                      )}

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
