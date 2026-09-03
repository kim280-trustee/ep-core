import { useState } from "react";

interface StockLevelDialogProps {
  currentMinimum: number;
  currentMaximum?: number;
  onSubmit: (
    minimumStockLevel: number,
    maximumStockLevel?: number,
  ) => Promise<void>;
  onClose: () => void;
}

export function StockLevelDialog({
  currentMinimum,
  currentMaximum,
  onSubmit,
  onClose,
}: StockLevelDialogProps) {

  const [minimum, setMinimum] =
    useState(String(currentMinimum));

  const [maximum, setMaximum] =
    useState(
      currentMaximum !== undefined
        ? String(currentMaximum)
        : "",
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async () => {

    const minimumValue =
      Number(minimum);

    const maximumValue =
      maximum.trim() === ""
        ? undefined
        : Number(maximum);

    if (
      !Number.isFinite(minimumValue) ||
      minimumValue < 0
    ) {
      setError(
        "Minimum stock level must be 0 or greater.",
      );
      return;
    }

    if (
      maximumValue !== undefined &&
      (
        !Number.isFinite(maximumValue) ||
        maximumValue < minimumValue
      )
    ) {
      setError(
        "Maximum stock level must be greater than or equal to the minimum.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit(
        minimumValue,
        maximumValue,
      );

      onClose();

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save stock levels.",
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">

        <h2 className="text-lg font-semibold">
          Stock Levels
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set when this item should trigger a stock alert.
        </p>

        <div className="mt-5 space-y-4">

          <div>
            <label
              htmlFor="minimum-stock-level"
              className="block text-sm font-medium"
            >
              Minimum Stock Level
            </label>

            <input
              id="minimum-stock-level"
              type="number"
              min="0"
              step="1"
              value={minimum}
              onChange={(event) =>
                setMinimum(event.target.value)
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="maximum-stock-level"
              className="block text-sm font-medium"
            >
              Maximum Stock Level
              <span className="ml-1 text-gray-400">
                (optional)
              </span>
            </label>

            <input
              id="maximum-stock-level"
              type="number"
              min="0"
              step="1"
              value={maximum}
              onChange={(event) =>
                setMaximum(event.target.value)
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

        </div>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Levels"}
          </button>

        </div>

      </div>

    </div>
  );
}
