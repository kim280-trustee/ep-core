import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePurchaseOrderStore } from "@/features/purchasing/store/purchase-order.store";
import { storeContext } from "@/core/store/store.context";
import { productService } from "@/features/products/services/product.service";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { purchaseReturnService } from "../services/purchase-return.service";
import type { PurchaseReturn } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const returnReasons = [
  "Damaged item",
  "Wrong item",
  "Excess quantity",
  "Quality issue",
  "Supplier request",
  "Other",
];

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function CreatePurchaseReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseOrders = usePurchaseOrderStore((state) => state.orders);
  const loadPurchaseOrders = usePurchaseOrderStore((state) => state.loadOrders);
  const context = storeContext.getStore();

  const [purchaseOrderId, setPurchaseOrderId] = useState(
    searchParams.get("purchaseOrderId") ?? "",
  );
  const [purchaseOrderItemId, setPurchaseOrderItemId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [existingReturns, setExistingReturns] = useState<PurchaseReturn[]>([]);

  useEffect(() => {
    if (!context?.tenantId) return;

    void loadPurchaseOrders(context.tenantId);

    void purchaseReturnService
      .getReturns(context.tenantId)
      .then(setExistingReturns)
      .catch((error) =>
        console.error("Failed to load purchase returns:", error),
      );
  }, [context?.tenantId, loadPurchaseOrders]);

  const returnableOrders = useMemo(
    () =>
      purchaseOrders.filter(
        (order) =>
          order.status === "RECEIVED" ||
          order.status === "PARTIALLY_RECEIVED",
      ),
    [purchaseOrders],
  );

  const selectedOrder = purchaseOrders.find(
    (order) => order.id === purchaseOrderId,
  );

  const returnedByItem = useMemo(() => {
    const map = new Map<string, number>();

    for (const purchaseReturn of existingReturns) {
      if (
        purchaseReturn.status === "CANCELLED" ||
        purchaseReturn.purchaseOrderId !== purchaseOrderId
      ) {
        continue;
      }

      for (const item of purchaseReturn.items) {
        map.set(
          item.purchaseOrderItemId,
          (map.get(item.purchaseOrderItemId) ?? 0) + item.quantity,
        );
      }
    }

    return map;
  }, [existingReturns, purchaseOrderId]);

  const returnableItems = useMemo(
    () =>
      selectedOrder?.items.filter((item) => {
        const alreadyReturned = returnedByItem.get(item.id) ?? 0;
        return item.receivedQuantity - alreadyReturned > 0;
      }) ?? [],
    [selectedOrder, returnedByItem],
  );

  const selectedItem = returnableItems.find(
    (item) => item.id === purchaseOrderItemId,
  );

  const returnableQuantity = selectedItem
    ? selectedItem.receivedQuantity -
      (returnedByItem.get(selectedItem.id) ?? 0)
    : 0;

  const returnValue = selectedItem
    ? quantity * selectedItem.unitCost
    : 0;

  useEffect(() => {
    let cancelled = false;

    async function loadNames() {
      if (!selectedOrder || !context?.tenantId) {
        setSupplierName("");
        setWarehouseName("");
        setProductNames({});
        return;
      }

      try {
        const supplier = await supplierService.getSupplierById(
          context.tenantId,
          selectedOrder.supplierId,
        );

        const warehouse = selectedOrder.warehouseId
          ? await warehouseService.getWarehouseById(selectedOrder.warehouseId)
          : undefined;

        const products = await Promise.all(
          returnableItems.map(async (item) => {
            try {
              const product = await productService.getProductById(
                context.tenantId,
                item.productId,
              );

              return [
                item.productId,
                product
                  ? `${product.name} — SKU: ${product.sku}`
                  : "Unknown Product",
              ] as const;
            } catch {
              return [item.productId, "Unknown Product"] as const;
            }
          }),
        );

        if (cancelled) return;

        setSupplierName(supplier?.name ?? "Unknown Supplier");
        setWarehouseName(warehouse?.name ?? "Unknown Warehouse");
        setProductNames(Object.fromEntries(products));
      } catch {
        if (!cancelled) {
          setSupplierName("Unknown Supplier");
          setWarehouseName("Unknown Warehouse");
          setProductNames({});
        }
      }
    }

    void loadNames();

    return () => {
      cancelled = true;
    };
  }, [
    context?.tenantId,
    selectedOrder?.id,
    selectedOrder?.supplierId,
    selectedOrder?.warehouseId,
    returnableItems,
  ]);

  async function handleSubmit() {
    setMessage("");

    if (!context?.tenantId) {
      setMessage("Tenant context is not initialized.");
      return;
    }

    if (!context.storeId) {
      setMessage("Store context is not initialized.");
      return;
    }

    if (!selectedOrder) {
      setMessage("Please select a purchase order.");
      return;
    }

    if (!selectedOrder.warehouseId) {
      setMessage("The purchase order has no warehouse.");
      return;
    }

    if (!selectedItem) {
      setMessage("Please select an item.");
      return;
    }

    if (quantity <= 0) {
      setMessage("Return quantity must be greater than zero.");
      return;
    }

    if (quantity > returnableQuantity) {
      setMessage(`Only ${returnableQuantity} units are available for return.`);
      return;
    }

    try {
      const purchaseReturn = await purchaseReturnService.createReturn({
        tenantId: context.tenantId,
        storeId: context.storeId,
        purchaseOrderId: selectedOrder.id,
        supplierId: selectedOrder.supplierId,
        warehouseId: selectedOrder.warehouseId,
        reason: reason.trim() || null,
        items: [
          {
            purchaseOrderItemId: selectedItem.id,
            productId: selectedItem.productId,
            quantity,
            unitCost: selectedItem.unitCost,
            reason: reason.trim() || null,
          },
        ],
      });

      setMessage(
        `${purchaseReturn.returnNumber} completed successfully. Inventory was reduced.`,
      );

      navigate(`/purchasing/returns/${purchaseReturn.id}`);
    } catch (error) {
      console.error("Failed to create purchase return:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create purchase return.",
      );
    }
  }

  function resetSelection() {
    setPurchaseOrderId("");
    setPurchaseOrderItemId("");
    setQuantity(0);
    setReason("");
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Purchasing</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Create Purchase Return
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Return received goods to the supplier and record the supplier credit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchasing/returns")}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Returns
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                1
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Purchase Order</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Select a purchase order with received goods.
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Purchase Order
              <select
                value={purchaseOrderId}
                onChange={(event) => {
                  setPurchaseOrderId(event.target.value);
                  setPurchaseOrderItemId("");
                  setQuantity(0);
                  setReason("");
                  setMessage("");
                }}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select Purchase Order</option>
                {returnableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} · {formatStatus(order.status)} · {currencyFormatter.format(order.totalAmount)}
                  </option>
                ))}
              </select>
            </label>

            {selectedOrder && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</p>
                  <p className="mt-1 font-semibold text-slate-900">{supplierName}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Warehouse</p>
                  <p className="mt-1 font-semibold text-slate-900">{warehouseName}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Order Total</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {currencyFormatter.format(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                2
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Items to Return</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Choose the received product and quantity to send back.
                </p>
              </div>
            </div>

            {!selectedOrder ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">Select a purchase order first</p>
                <p className="mt-1 text-sm text-slate-500">Available received items will appear here.</p>
              </div>
            ) : returnableItems.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                There are no remaining quantities available for return on this purchase order.
              </div>
            ) : (
              <div className="space-y-3">
                {returnableItems.map((item) => {
                  const available =
                    item.receivedQuantity - (returnedByItem.get(item.id) ?? 0);
                  const selected = item.id === purchaseOrderItemId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPurchaseOrderItemId(item.id);
                        setQuantity(0);
                        setMessage("");
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {productNames[item.productId] ?? "Loading product..."}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Received {item.receivedQuantity} · Already returned {returnedByItem.get(item.id) ?? 0}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Returnable</p>
                            <p className="font-semibold text-slate-900">{available}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Unit cost</p>
                            <p className="font-semibold text-slate-900">{currencyFormatter.format(item.unitCost)}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {selectedItem && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                  3
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">Return Details</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Specify how much is being returned and why.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Quantity to Return
                  <input
                    type="number"
                    min="1"
                    max={returnableQuantity || undefined}
                    value={quantity || ""}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <span className="mt-1.5 block text-xs text-slate-500">
                    Maximum available: {returnableQuantity} unit{returnableQuantity === 1 ? "" : "s"}
                  </span>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Return Reason
                  <select
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Select a reason</option>
                    {returnReasons.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {reason === "Other" && (
                <label className="mt-5 block text-sm font-medium text-slate-700">
                  Additional details
                  <textarea
                    value={reason === "Other" ? "" : reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Describe the reason for the return"
                    rows={3}
                    className="mt-2 block w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              )}
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                4
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Return Summary</h2>
                <p className="mt-0.5 text-sm text-slate-500">Supplier credit generated by this return.</p>
              </div>
            </div>

            {selectedItem ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {productNames[selectedItem.productId] ?? "Loading product..."}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-medium text-slate-900">{quantity || 0}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Unit cost</span>
                    <span className="font-medium text-slate-900">
                      {currencyFormatter.format(selectedItem.unitCost)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Supplier credit</span>
                    <span className="text-xl font-bold text-slate-950">
                      {currencyFormatter.format(returnValue)}
                    </span>
                  </div>
                </div>

                {message && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={quantity <= 0 || quantity > returnableQuantity}
                  className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Complete Purchase Return
                </button>

                <button
                  type="button"
                  onClick={resetSelection}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm font-medium text-slate-700">No item selected</p>
                <p className="mt-1 text-xs text-slate-500">
                  Select a purchase order and item to see the return value.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
