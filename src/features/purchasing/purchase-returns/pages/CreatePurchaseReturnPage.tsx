import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePurchaseOrderStore } from "@/features/purchasing/store/purchase-order.store";
import { storeContext } from "@/core/store/store.context";
import { productService } from "@/features/products/services/product.service";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { purchaseReturnService } from "../services/purchase-return.service";
import type { PurchaseReturn } from "../types";

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
          ? await warehouseService.getWarehouseById(
              selectedOrder.warehouseId,
            )
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
      setMessage(
        `Only ${returnableQuantity} units are available for return.`,
      );
      return;
    }

    try {
      const purchaseReturn =
        await purchaseReturnService.createReturn({
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

      navigate(
        `/purchasing/returns/${purchaseReturn.id}`,
      );
    } catch (error) {
      console.error(
        "Failed to create purchase return:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create purchase return.",
      );
    }
  }

  return (
    <div>
      <h1>Create Purchase Return</h1>

      <p>Return received goods to the supplier.</p>

      <div>
        <label>Purchase Order</label>

        <select
          value={purchaseOrderId}
          onChange={(event) => {
            setPurchaseOrderId(event.target.value);
            setPurchaseOrderItemId("");
            setQuantity(0);
            setReason("");
            setMessage("");
          }}
        >
          <option value="">Select Purchase Order</option>

          {returnableOrders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.orderNumber} — {order.status}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div>
          <p>Supplier: {supplierName}</p>
          <p>Warehouse: {warehouseName}</p>
        </div>
      )}

      <div>
        <label>Item</label>

        <select
          value={purchaseOrderItemId}
          onChange={(event) => {
            setPurchaseOrderItemId(event.target.value);
            setQuantity(0);
            setMessage("");
          }}
          disabled={!selectedOrder}
        >
          <option value="">Select Item</option>

          {returnableItems.map((item) => {
            const available =
              item.receivedQuantity -
              (returnedByItem.get(item.id) ?? 0);

            return (
              <option key={item.id} value={item.id}>
                {productNames[item.productId] ?? "Unknown Product"}
                {" — Returnable: "}
                {available}
                {" — Cost: "}
                {item.unitCost}
              </option>
            );
          })}
        </select>
      </div>

      {selectedItem && (
        <p>Available for return: {returnableQuantity}</p>
      )}

      <div>
        <label>Quantity to Return</label>

        <input
          type="number"
          min="1"
          max={returnableQuantity || undefined}
          value={quantity}
          onChange={(event) =>
            setQuantity(Number(event.target.value))
          }
          disabled={!selectedItem}
        />
      </div>

      <div>
        <label>Return Reason</label>

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Optional reason for return"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedItem || quantity <= 0}
      >
        Complete Purchase Return
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

