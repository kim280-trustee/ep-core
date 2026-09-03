import { useState } from "react";
import type {
  StockAdjustment,
  StockAdjustmentReason,
} from "../types/stock-adjustment.types";

interface Props {
  productId: string;
  tenantId: string;
  storeId: string;
  warehouseId: string;
  adjustedBy: string;
  onSubmit: (adjustment: StockAdjustment) => void | Promise<void>;
  onClose: () => void;
}

export function StockAdjustmentDialog({
  productId,
  tenantId,
  storeId,
  warehouseId,
  adjustedBy,
  onSubmit,
  onClose,
}: Props) {
  const [quantity, setQuantity] = useState("");
  const [adjustmentType, setAdjustmentType] =
    useState<"INCREASE" | "DECREASE">("INCREASE");
  const [reason, setReason] =
    useState<StockAdjustmentReason>("MANUAL");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        id: crypto.randomUUID(),
        tenantId,
        storeId,
        productId,
        warehouseId,
        quantity: parsedQuantity,
        adjustmentType,
        reason,
        adjustedBy,
        adjustedAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded border bg-background p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Stock Adjustment</h2>
        <p className="text-sm text-muted-foreground">
          Adjust the stock quantity for this warehouse.
        </p>
      </div>

      <input
        type="number"
        min="0"
        step="1"
        placeholder="Quantity"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        className="w-full rounded border p-2"
      />

      <select
        value={adjustmentType}
        onChange={(event) =>
          setAdjustmentType(
            event.target.value as "INCREASE" | "DECREASE",
          )
        }
        className="w-full rounded border p-2"
      >
        <option value="INCREASE">Increase</option>
        <option value="DECREASE">Decrease</option>
      </select>

      <select
        value={reason}
        onChange={(event) =>
          setReason(
            event.target.value as StockAdjustmentReason,
          )
        }
        className="w-full rounded border p-2"
      >
        <option value="MANUAL">Manual</option>
        <option value="DAMAGED">Damaged</option>
        <option value="EXPIRED">Expired</option>
        <option value="LOST">Lost</option>
        <option value="FOUND">Found</option>
        <option value="STOCK_COUNT">Stock Count</option>
      </select>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
