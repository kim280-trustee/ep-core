import {
  useEffect,
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


export default function PurchaseOrderDetailsPage() {

  const {
    id,
  } = useParams();

  const {
    orders,
    loadOrders,
    addItem,
  } = usePurchaseOrders();

  useEffect(() => {

    const context =
      storeContext.getStore();

    if (
      context?.tenantId
    ) {

      loadOrders(
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


  if (!order) {

    return (

      <div>

        Loading Purchase Order...

      </div>

    );

  }


  const orderId =
    order.id;


  function handleAddItem(
    item: PurchaseOrderItem,
  ) {

    void addItem(
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
          {order.supplierId}
        </p>


        <p>
          Warehouse:
          {" "}
          {order.warehouseId ?? "Not assigned"}
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
      />


      <hr />


      <PurchaseOrderSummary
        order={order}
      />

    </div>

  );

}

