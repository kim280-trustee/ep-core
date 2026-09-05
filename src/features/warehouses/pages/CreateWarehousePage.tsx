import { useNavigate } from "react-router-dom";
import { WarehouseForm } from "../components/WarehouseForm";
import { warehouseService } from "../services/warehouse.service";
import { storeContext } from "@/core/store/store.context";

type WarehouseFormData =
  Parameters<
    NonNullable<
      React.ComponentProps<
        typeof WarehouseForm
      >["onSubmit"]
    >
  >[0];

export function CreateWarehousePage() {
  const navigate = useNavigate();

  async function handleSubmit(data: WarehouseFormData) {
    const context = storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    await warehouseService.createWarehouse(
      context.tenantId,
      context.storeId,
      data,
    );

    navigate("/warehouses");
  }

  return (
    <WarehouseForm
      onSubmit={handleSubmit}
    />
  );
}
