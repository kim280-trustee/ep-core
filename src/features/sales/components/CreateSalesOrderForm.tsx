import {
  useEffect,
  useState,
} from "react";

import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  warehouseRepository,
} from "@/features/warehouses/repositories";

import type {
  Warehouse,
} from "@/features/warehouses/types/warehouse.types";

import { useTranslation } from "@/core/i18n/useTranslation";

export default function CreateSalesOrderForm() {
  const { t } = useTranslation();

  const {
    createDraft,
  } = useSalesOrders();

  const context = storeContext.getStore();

  const [warehouses, setWarehouses] =
    useState<Warehouse[]>([]);

  const [warehouseId, setWarehouseId] =
    useState("");

  const [warehouseName, setWarehouseName] =
    useState("");

  const [warehouseCode, setWarehouseCode] =
    useState("MAIN");

  const [loading, setLoading] =
    useState(false);

  const [creatingWarehouse, setCreatingWarehouse] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function loadWarehouses() {
    if (
      !context?.tenantId ||
      !context.storeId
    ) {
      setWarehouses([]);
      setWarehouseId("");
      return;
    }

    try {
      const available =
        (
          await warehouseRepository.findAll()
        ).filter(
          (warehouse) =>
            warehouse.tenantId === context.tenantId &&
            warehouse.storeId === context.storeId,
        );

      setWarehouses(available);

      setWarehouseId(
        (current) =>
          available.some(
            (warehouse) =>
              warehouse.id === current,
          )
            ? current
            : available[0]?.id ?? "",
      );
    } catch (error) {
      console.error(
        "Failed to load sales warehouses:",
        error,
      );

      setWarehouses([]);
      setWarehouseId("");
      setError(
        error instanceof Error
          ? error.message
          : t("sales.failedToLoadWarehouses"),
      );
    }
  }

  useEffect(() => {
    void loadWarehouses();
  }, [
    context?.tenantId,
    context?.storeId,
  ]);

  async function handleCreateWarehouse() {
    setError(null);

    if (!context?.tenantId) {
      setError(t("sales.tenantContextNotInitialized"));
      return;
    }

    if (!context.storeId) {
      setError(t("sales.storeContextNotInitialized"));
      return;
    }

    if (!warehouseName.trim()) {
      setError(t("sales.warehouseNameRequired"));
      return;
    }

    if (!warehouseCode.trim()) {
      setError(t("sales.warehouseCodeRequired"));
      return;
    }

    setCreatingWarehouse(true);

    try {
      const warehouse =
        await warehouseRepository.create({
          tenantId:
            context.tenantId,

          storeId:
            context.storeId,

          code:
            warehouseCode.trim(),

          name:
            warehouseName.trim(),

          address: "",
          city: "",
          province: "",
          postalCode: "",
          country: "Thailand",
        });

      setWarehouses(
        (current) => [
          ...current,
          warehouse,
        ],
      );

      setWarehouseId(
        warehouse.id,
      );

      setWarehouseName("");
      setWarehouseCode("MAIN");
    } catch (error) {
      console.error(
        "Failed to create warehouse:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : t("sales.failedToCreateWarehouse"),
      );
    } finally {
      setCreatingWarehouse(false);
    }
  }

  async function handleSubmit() {
    setError(null);

    if (!context?.tenantId) {
      setError(t("sales.tenantContextNotInitialized"));
      return;
    }

    if (!context.storeId) {
      setError(t("sales.storeContextNotInitialized"));
      return;
    }

    if (!warehouseId) {
      setError(t("sales.selectWarehouse"));
      return;
    }

    setLoading(true);

    try {
      await createDraft({
        tenantId:
          context.tenantId,

        storeId:
          context.storeId,

        warehouseId,
      });
    } catch (error) {
      console.error(
        "Failed to create sales order:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : t("sales.failedToCreateOrder"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">
        {t("sales.createSalesOrder")}
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        {t("sales.business")}:{" "}
        {context?.name ?? t("sales.notInitialized")}
      </p>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">
          {t("sales.warehouse")}
        </label>

        <select
          value={warehouseId}
          disabled={warehouses.length === 0}
          onChange={(event) =>
            setWarehouseId(
              event.target.value,
            )
          }
          className="w-full rounded border p-2"
        >
          <option value="">
            {t("sales.selectWarehouse")}
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

      {warehouses.length === 0 && (
        <div className="mt-4 rounded border bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            {t("sales.noWarehouseFound")}
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              placeholder={t("sales.warehouseCode")}
              value={warehouseCode}
              onChange={(event) =>
                setWarehouseCode(
                  event.target.value,
                )
              }
              className="rounded border p-2"
            />

            <input
              placeholder={t("sales.warehouseName")}
              value={warehouseName}
              onChange={(event) =>
                setWarehouseName(
                  event.target.value,
                )
              }
              className="rounded border p-2"
            />
          </div>

          <button
            type="button"
            disabled={
              creatingWarehouse ||
              !warehouseName.trim() ||
              !warehouseCode.trim()
            }
            onClick={() => {
              void handleCreateWarehouse();
            }}
            className="mt-3 rounded bg-gray-800 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {creatingWarehouse
              ? t("sales.creating")
              : t("sales.createWarehouse")}
          </button>
        </div>
      )}

      <button
        type="button"
        disabled={
          loading ||
          !warehouseId
        }
        onClick={() => {
          void handleSubmit();
        }}
        className="mt-5 rounded bg-black px-5 py-2 text-white disabled:opacity-50"
      >
        {loading
          ? t("sales.creating")
          : t("sales.createOrder")}
      </button>
    </div>
  );
}
