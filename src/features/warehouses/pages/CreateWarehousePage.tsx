import {
  useNavigate,
} from "react-router-dom";


import {
  WarehouseForm,
} from "../components/WarehouseForm";


import {
  warehouseService,
} from "../services/warehouse.service";


type WarehouseFormData =
  Parameters<
    NonNullable<
      React.ComponentProps<
        typeof WarehouseForm
      >["onSubmit"]
    >
  >[0];


export function CreateWarehousePage() {


  const navigate =
    useNavigate();


  async function handleSubmit(
    data: WarehouseFormData,
  ) {

    /*
     * Tenant context will be supplied by the
     * authenticated application context.
     *
     * For the current Production V1 warehouse
     * database contract, the authenticated tenant
     * is the warehouse owner.
     */

    const tenantId =
      localStorage.getItem(
        "tenantId",
      );


    const storeId =
      localStorage.getItem(
        "storeId",
      );


    if (!tenantId) {

      throw new Error(
        "Tenant context is not available.",
      );

    }


    await warehouseService.createWarehouse(

      tenantId,

      storeId ?? tenantId,

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
