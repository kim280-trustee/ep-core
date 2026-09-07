import { useParams } from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";

import {
  PurchaseOrderSummary,
} from "../components/PurchaseOrderSummary";

import {
  PurchaseOrderItemTable,
} from "../components/PurchaseOrderItemTable";

import {
  PurchaseOrderItemForm,
} from "../components/PurchaseOrderItemForm";

import {
  PurchaseOrderActions,
} from "../components/PurchaseOrderActions";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  supplierService,
} from "@/features/suppliers/services/supplier.service";

import {
  warehouseService,
} from "@/features/warehouses/services/warehouse.service";


function statusClasses(status: PurchaseOrder["status"]) {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";
    case "SUBMITTED":
      return "bg-amber-100 text-amber-800";
    case "APPROVED":
      return "bg-blue-100 text-blue-800";
    case "PARTIALLY_RECEIVED":
      return "bg-purple-100 text-purple-800";
    case "RECEIVED":
      return "bg-emerald-100 text-emerald-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}


export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();

  const {
    orders,
    loadOrders,
    addItem,
  } = usePurchaseOrders();

  const [supplierName, setSupplierName] =
    useState("Loading...");

  const [warehouseName, setWarehouseName] =
    useState("Loading...");


  useEffect(() => {
    const context = storeContext.getStore();

    if (context?.tenantId) {
      void loadOrders(context.tenantId);
    }
  }, [loadOrders]);


  const order = id
    ? orders.find((item) => item.id === id)
    : undefined;


  useEffect(() => {
    let cancelled = false;

    async function loadRelatedNames() {
      if (!order) return;

      const context = storeContext.getStore();

      if (!context?.tenantId) return;

      setSupplierName("Loading...");
      setWarehouseName("Loading...");

      try {
        const supplier =
          await supplierService.getSupplierById(
            context.tenantId,
            order.supplierId,
          );

        if (!cancelled) {
          setSupplierName(
            supplier?.name ?? "Unknown Supplier",
          );
        }

        if (order.warehouseId) {
          const warehouse =
            await warehouseService.getWarehouseById(
              order.warehouseId,
            );

          if (!cancelled) {
            setWarehouseName(
              warehouse?.name ?? "Unknown Warehouse",
            );
          }
        } else if (!cancelled) {
          setWarehouseName("Not assigned");
        }
      } catch (error) {
        console.error(
          "Failed to load purchase order related names:",
          error,
        );

        if (!cancelled) {
          setSupplierName("Unknown Supplier");
          setWarehouseName(
            order.warehouseId
              ? "Unknown Warehouse"
              : "Not assigned",
          );
        }
      }
    }

    void loadRelatedNames();

    return () => {
      cancelled = true;
    };
  }, [
    order?.id,
    order?.supplierId,
    order?.warehouseId,
  ]);


  if (!order) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading Purchase Order...
        </p>
      </div>
    );
  }


  async function handleAddItem(
    item: PurchaseOrderItem,
  ) {
    await addItem(order!.id, item);
  }


  const canAddItems =
    order.status === "DRAFT";


  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Purchasing
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Purchase Order
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review the order, add products, and move it through the receiving workflow.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Order Number
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {order.orderNumber}
          </p>
        </div>
      </div>


      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Supplier
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {supplierName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Warehouse
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {warehouseName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(order.status)}`}
              >
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
          </div>

        </div>
      </div>


      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Workflow
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            What happens next?
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete the highlighted action to move this purchase order forward.
          </p>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-4">
          {[
            ["1", "Add Products", "Build the order"],
            ["2", "Submit", "Send for approval"],
            ["3", "Approve", "Authorize purchasing"],
            ["4", "Receive", "Update inventory"],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className={`rounded-lg border p-4 ${
                (number === "1" && order.status === "DRAFT") ||
                (number === "2" && order.status === "DRAFT" && order.items.length > 0) ||
                (number === "3" && order.status === "SUBMITTED") ||
                (number === "4" &&
                  (order.status === "APPROVED" ||
                    order.status === "PARTIALLY_RECEIVED"))
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                  {number}
                </span>

                <div>
                  <p className="font-semibold text-slate-900">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <PurchaseOrderActions order={order} />
      </div>


      {canAddItems && (
        <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Step 1
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Add Products
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search for a product, enter the quantity and cost, then add it to this order.
            </p>
          </div>

          <PurchaseOrderItemForm
            purchaseOrderId={order.id}
            tenantId={order.tenantId}
            onAddItem={handleAddItem}
          />
        </div>
      )}


      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Ordered Products
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Products and quantities included in this purchase order.
          </p>
        </div>

        <PurchaseOrderItemTable
          items={order.items}
          tenantId={order.tenantId}
        />
      </div>


      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <PurchaseOrderSummary order={order} />
      </div>

    </div>
  );
}




