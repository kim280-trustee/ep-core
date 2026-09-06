import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  WarehouseForm,
} from "../components/WarehouseForm";

import {
  warehouseService,
} from "../services/warehouse.service";

import type {
  Warehouse,
} from "../types/warehouse.types";

type WarehouseFormData =
  Parameters<
    NonNullable<
      React.ComponentProps<
        typeof WarehouseForm
      >["onSubmit"]
    >
  >[0];

export function EditWarehousePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [
    warehouse,
    setWarehouse,
  ] = useState<
    Warehouse | undefined
  >();

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    async function loadWarehouse() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const result =
          await warehouseService.getWarehouseById(
            id,
          );

        setWarehouse(result);
      } finally {
        setLoading(false);
      }
    }

    void loadWarehouse();
  }, [id]);

  async function handleSubmit(
    data: WarehouseFormData,
  ) {
    if (!id) {
      return;
    }

    await warehouseService.updateWarehouse(
      id,
      data,
    );

    navigate("/warehouses");
  }

  if (loading) {
    return (
      <div>
        Loading warehouse...
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div>
        Warehouse not found
      </div>
    );
  }

  return (
    <WarehouseForm
      defaultValues={{
        code:
          warehouse.code,
        name:
          warehouse.name,
        address:
          warehouse.address,
        city:
          warehouse.city,
        province:
          warehouse.province,
        postalCode:
          warehouse.postalCode,
        country:
          warehouse.country,
        phone:
          warehouse.phone,
        managerName:
          warehouse.managerName,
      }}
      onSubmit={
        handleSubmit
      }
    />
  );
}
