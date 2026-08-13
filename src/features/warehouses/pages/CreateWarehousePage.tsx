import {
  useNavigate,
} from "react-router-dom";

import {
  WarehouseForm,
} from "../components/WarehouseForm";

import {
  warehouseService,
} from "../services/warehouse.service";

import type {
  WarehouseFormInput,
} from "../validators/warehouse.schema";

import {
  storeContext,
} from "@/core/store/store.context";

export function CreateWarehousePage() {

  const navigate =
    useNavigate();

  function handleSubmit(
    data: WarehouseFormInput,
  ) {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    warehouseService.createWarehouse(
      context.tenantId,
      context.storeId,
      data,
    );

    navigate(
      "/warehouses",
    );
  }

  return (
    <WarehouseForm
      onSubmit={
        handleSubmit
      }
    />
  );
}
