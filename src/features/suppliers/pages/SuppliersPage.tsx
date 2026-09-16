import { useState } from "react";

import { useSuppliers } from "../hooks/useSuppliers";
import { SupplierToolbar } from "../components/SupplierToolbar";
import { SupplierTable } from "../components/SupplierTable";

export function SuppliersPage() {
  const { suppliers, removeSupplier } = useSuppliers();

  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingSupplier = pendingDeleteId
    ? suppliers.find((supplier) => supplier.id === pendingDeleteId)
    : undefined;

  function handleDelete(id: string) {
    setDeleteError(null);
    setPendingDeleteId(id);
  }

  async function confirmDelete() {
    if (!pendingDeleteId || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const deleted = await removeSupplier(pendingDeleteId);

      if (!deleted) {
        throw new Error("Supplier could not be deleted.");
      }

      setPendingDeleteId(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Supplier could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function cancelDelete() {
    if (deleting) return;
    setPendingDeleteId(null);
    setDeleteError(null);
  }

  return (
    <div>
      <SupplierToolbar
        search={search}
        onSearchChange={setSearch}
      />

      <SupplierTable
        suppliers={filtered}
        onDelete={handleDelete}
      />

      {pendingSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-supplier-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2
              id="delete-supplier-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete supplier?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete {pendingSupplier.name}?
            </p>

            {deleteError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="min-h-11 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
