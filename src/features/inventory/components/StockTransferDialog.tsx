import { useEffect, useState } from "react";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { storeContext } from "@/core/store/store.context";
import type { Warehouse } from "@/features/warehouses/types/warehouse.types";

interface StockTransferDialogProps {
  productId: string;
  tenantId: string;
  fromStoreId: string;
  sourceWarehouseId: string;
  transferredBy: string;
  onSubmit: (transfer: {
    productId: string;
    destinationWarehouseId: string;
    quantity: number;
    reason?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function StockTransferDialog({
  productId,
  tenantId,
  fromStoreId,
  sourceWarehouseId,
  transferredBy: _transferredBy,
  onSubmit,
  onClose,
}: StockTransferDialogProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [destinationWarehouseId, setDestinationWarehouseId] =
    useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadWarehouses() {
      setLoading(true);
      setError(null);

      try {
        const result = await warehouseService.getWarehouses();

        const context = storeContext.getStore();

        const currentStoreId =
          context?.storeId ?? fromStoreId;

        const availableWarehouses = result.filter(
          (warehouse) =>
            warehouse.tenantId === tenantId &&
            warehouse.storeId === currentStoreId &&
            warehouse.status === "ACTIVE" &&
            warehouse.id !== sourceWarehouseId,
        );

        if (active) {
          setWarehouses(availableWarehouses);
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Failed to load warehouses.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadWarehouses();

    return () => {
      active = false;
    };
  }, [
    tenantId,
    fromStoreId,
    sourceWarehouseId,
  ]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    const parsedQuantity = Number(quantity);

    if (!destinationWarehouseId) {
      setError("Please select a destination warehouse.");
      return;
    }

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Transfer quantity must be greater than zero.",
      );
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        productId,
        destinationWarehouseId,
        quantity: parsedQuantity,
        reason: reason.trim() || undefined,
      });

      setQuantity("");
      setReason("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to transfer stock.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl"
      >
        <div>
          <h2 className="text-lg font-semibold">
            Stock Transfer
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Move stock from this warehouse to another
            active warehouse in the same store.
          </p>
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Select destination warehouse
          </label>

          <select
            value={destinationWarehouseId}
            onChange={(event) =>
              setDestinationWarehouseId(
                event.target.value,
              )
            }
            disabled={
              loading ||
              saving ||
              warehouses.length === 0
            }
            className="w-full rounded border px-3 py-2"
          >
            <option value="">
              {loading
                ? "Loading warehouses..."
                : warehouses.length === 0
                  ? "No other warehouses available"
                  : "Select warehouse"}
            </option>

            {warehouses.map((warehouse) => (
              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name} ({warehouse.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Quantity
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(event) =>
              setQuantity(event.target.value)
            }
            disabled={saving}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Reason
          </label>

          <input
            type="text"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            disabled={saving}
            className="w-full rounded border px-3 py-2"
            placeholder="Optional"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loading ||
              warehouses.length === 0
            }
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Transferring..." : "Transfer"}
          </button>
        </div>
      </form>
    </div>
  );
}

