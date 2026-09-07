import {
  useState,
} from "react";

import {
  ArrowRight,
  ClipboardList,
  MapPin,
  Truck,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";

import {
  useSuppliers,
} from "@/features/suppliers/hooks/useSuppliers";

import {
  useWarehouses,
} from "@/features/warehouses/hooks/useWarehouses";

import {
  storeContext,
} from "@/core/store/store.context";


export default function CreatePurchaseOrderPage() {

  const navigate =
    useNavigate();

  const {
    createDraft,
  } = usePurchaseOrders();

  const {
    suppliers,
  } = useSuppliers();

  const {
    warehouses,
    loading: warehousesLoading,
  } = useWarehouses();

  const [
    supplierId,
    setSupplierId,
  ] = useState("");

  const [
    warehouseId,
    setWarehouseId,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit() {

    setError("");

    const context =
      storeContext.getStore();

    if (!context) {

      setError(
        "Store context is not initialized.",
      );

      return;

    }

    if (!supplierId) {

      setError(
        "Please select a supplier.",
      );

      return;

    }

    if (!warehouseId) {

      setError(
        "Please select a warehouse.",
      );

      return;

    }

    try {

      setSubmitting(true);

      const order =
        await createDraft({

          tenantId:
            context.tenantId,

          storeId:
            context.storeId,

          supplierId,

          warehouseId,

          notes,

        });

      navigate(
        `/purchasing/${order.id}`,
      );

    } catch (caughtError) {

      console.error(
        "Failed to create purchase order:",
        caughtError,
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to create purchase order.",
      );

    } finally {

      setSubmitting(false);

    }

  }


  return (

    <div className="-mx-4 -my-6 min-h-full bg-slate-100 px-4 py-6 pb-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-8">
          <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-20 h-28 w-28 translate-y-1/2 rounded-full bg-white/[0.03]" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
              <ClipboardList size={22} />
            </div>
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Purchasing</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Create Purchase Order</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Start a draft order by choosing the supplier and destination warehouse. You can add products and quantities after the draft is created.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Truck size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Order setup</h2>
              <p className="mt-1 text-sm text-slate-500">Choose where this purchase is coming from and where it will be received.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Truck size={17} />
                </div>
                <div>
                  <label htmlFor="purchase-order-supplier" className="text-sm font-bold text-slate-900">Supplier</label>
                  <p className="text-xs text-slate-500">Who are you ordering from?</p>
                </div>
              </div>
              <select
                id="purchase-order-supplier"
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(
                    event.target.value,
                  )
                }
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(
                  (supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <MapPin size={17} />
                </div>
                <div>
                  <label htmlFor="purchase-order-warehouse" className="text-sm font-bold text-slate-900">Warehouse</label>
                  <p className="text-xs text-slate-500">Where should the stock be received?</p>
                </div>
              </div>
              <select
                id="purchase-order-warehouse"
                value={warehouseId}
                onChange={(event) =>
                  setWarehouseId(
                    event.target.value,
                  )
                }
                disabled={warehousesLoading}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {warehousesLoading
                    ? "Loading Warehouses..."
                    : "Select Warehouse"}
                </option>
                {warehouses.map(
                  (warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-3">
              <label htmlFor="purchase-order-notes" className="text-sm font-bold text-slate-900">Notes</label>
              <p className="mt-1 text-xs text-slate-500">Optional instructions or details for this purchase.</p>
            </div>
            <textarea
              id="purchase-order-notes"
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Add a note about delivery, pricing, or anything else to remember..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">This creates a draft only. Products and quantities are added next.</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !supplierId ||
                !warehouseId
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {submitting
                ? "Creating..."
                : "Create Draft"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </div>
        </section>
      </div>
    </div>

  );

}
