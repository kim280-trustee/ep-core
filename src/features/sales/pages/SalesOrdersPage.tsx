import {
  useEffect,
  useState,
} from "react";

import CreateSalesOrderForm
  from "../components/CreateSalesOrderForm";

import SalesOrderList
  from "../components/SalesOrderList";

import AddSalesOrderItemForm
  from "../components/AddSalesOrderItemForm";

import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

import { useTranslation } from "../../../core/i18n/useTranslation";

export default function SalesOrdersPage() {
  const { t } = useTranslation();

  const {
    orders,
  } = useSalesOrders();

  const [
    activeOrderId,
    setActiveOrderId,
  ] = useState("");

  useEffect(() => {
    if (activeOrderId) {
      const exists =
        orders.some(
          (order) =>
            order.id === activeOrderId &&
            order.status === "DRAFT",
        );

      if (exists) {
        return;
      }
    }

    const latestDraft =
      orders.find(
        (order) =>
          order.status === "DRAFT",
      );

    if (latestDraft) {
      setActiveOrderId(
        latestDraft.id,
      );
    }
  }, [
    orders,
    activeOrderId,
  ]);

  const activeOrder =
    orders.find(
      (order) =>
        order.id === activeOrderId,
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        {t("sales.title")}
      </h1>

      <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <CreateSalesOrderForm />
      </div>

      {activeOrder && (
        <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-5 rounded border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              {t("sales.activeSalesOrder")}
            </p>

            <p className="mt-1 text-xl font-semibold">
              {activeOrder.orderNumber}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {t("common.status")}: {activeOrder.status}
            </p>
          </div>

          <AddSalesOrderItemForm
            salesOrderId={activeOrder.id}
          />
        </div>
      )}

      {!activeOrder && (
        <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">
            {t("sales.createOrderFirst")}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
        <SalesOrderList />
      </div>
    </div>
  );
}
