import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

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


export default function PurchaseOrderDetailsPage() {

  const {
    id,
  } = useParams();

  const {
    orders,
    loadOrders,
    addItem,
  } = usePurchaseOrders();


  const [
    supplierName,
    setSupplierName,
  ] = useState("Loading...");


  const [
    warehouseName,
    setWarehouseName,
  ] = useState("Loading...");


  useEffect(() => {

    const context =
      storeContext.getStore();

    if (
      context?.tenantId
    ) {

      void loadOrders(
        context.tenantId,
      );

    }

  }, [
    loadOrders,
  ]);


  const order =
    id
      ? orders.find(
          (item) =>
            item.id === id,
        )
      : undefined;


  useEffect(() => {

    let cancelled = false;

    async function loadRelatedNames() {

      if (!order) {
        return;
      }

      const context =
        storeContext.getStore();

      if (!context?.tenantId) {
        return;
      }


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
            supplier?.name ??
            "Unknown Supplier",
          );

        }


        if (order.warehouseId) {

          const warehouse =
            await warehouseService.getWarehouseById(
              order.warehouseId,
            );


          if (!cancelled) {

            setWarehouseName(
              warehouse?.name ??
              "Unknown Warehouse",
            );

          }

        } else if (!cancelled) {

          setWarehouseName(
            "Not assigned",
          );

        }

      } catch (error) {

        console.error(
          "Failed to load purchase order related names:",
          error,
        );


        if (!cancelled) {

          setSupplierName(
            "Unknown Supplier",
          );

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

      <div>

        Loading Purchase Order...

      </div>

    );

  }


  const orderId =
    order.id;


  async function handleAddItem(
    item: PurchaseOrderItem,
  ) {

    await addItem(
      orderId,
      item,
    );

  }


  return (

    <div>

      <h1>
        Purchase Order Details
      </h1>


      <div>

        <p>
          Order Number:
          {" "}
          {order.orderNumber}
        </p>


        <p>
          Supplier:
          {" "}
          {supplierName}
        </p>


        <p>
          Warehouse:
          {" "}
          {warehouseName}
        </p>


        <p>
          Status:
          {" "}
          {order.status}
        </p>

      </div>


      <hr />


      <PurchaseOrderActions
        order={order}
      />


      <hr />


      {order.status === "DRAFT" && (

        <PurchaseOrderItemForm
          purchaseOrderId={orderId}
          tenantId={order.tenantId}
          onAddItem={handleAddItem}
        />

      )}


      <hr />


      <PurchaseOrderItemTable
        items={order.items}
        tenantId={order.tenantId}
      />


      <hr />


      <PurchaseOrderSummary
        order={order}
      />

    </div>

  );

}

