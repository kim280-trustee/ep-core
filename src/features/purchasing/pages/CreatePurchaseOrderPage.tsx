import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";

import {
  useSuppliers,
} from "@/features/suppliers/hooks/useSuppliers";

import {
  useWarehouses,
} from "@/features/warehouses/hooks/useWarehouses";

import {
  storeContext,
} from "@/core/store/store.context";


export default function CreatePurchaseOrderPage() {

  const navigate =
    useNavigate();

  const {
    createDraft,
  } = usePurchaseOrders();

  const {
    suppliers,
  } = useSuppliers();

  const {
    warehouses,
    loading: warehousesLoading,
  } = useWarehouses();

  const [
    supplierId,
    setSupplierId,
  ] = useState("");

  const [
    warehouseId,
    setWarehouseId,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit() {

    setError("");

    const context =
      storeContext.getStore();

    if (!context) {

      setError(
        "Store context is not initialized.",
      );

      return;

    }

    if (!supplierId) {

      setError(
        "Please select a supplier.",
      );

      return;

    }

    if (!warehouseId) {

      setError(
        "Please select a warehouse.",
      );

      return;

    }

    try {

      setSubmitting(true);

      const order =
        await createDraft({

          tenantId:
            context.tenantId,

          storeId:
            context.storeId,

          supplierId,

          warehouseId,

          notes,

        });

      navigate(
        `/purchasing/${order.id}`,
      );

    } catch (caughtError) {

      console.error(
        "Failed to create purchase order:",
        caughtError,
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to create purchase order.",
      );

    } finally {

      setSubmitting(false);

    }

  }


  return (

    <div>

      <h1>
        Create Purchase Order
      </h1>


      <div>

        <label>
          Supplier
        </label>

        <select
          value={supplierId}
          onChange={(event) =>
            setSupplierId(
              event.target.value,
            )
          }
        >

          <option value="">
            Select Supplier
          </option>

          {suppliers.map(
            (supplier) => (

              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>

            ),
          )}

        </select>

      </div>


      <div>

        <label>
          Warehouse
        </label>

        <select
          value={warehouseId}
          onChange={(event) =>
            setWarehouseId(
              event.target.value,
            )
          }
        >

          <option value="">
            {warehousesLoading
              ? "Loading Warehouses..."
              : "Select Warehouse"}
          </option>

          {warehouses.map(
            (warehouse) => (

              <option
                key={warehouse.id}
                value={warehouse.id}
              >
                {warehouse.name}
                {" ("}
                {warehouse.code}
                {")"}
              </option>

            ),
          )}

        </select>

      </div>


      <div>

        <label>
          Notes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
        />

      </div>


      {error && (

        <p>
          {error}
        </p>

      )}


      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          submitting ||
          !supplierId ||
          !warehouseId
        }
      >

        {submitting
          ? "Creating..."
          : "Create Draft"}

      </button>

    </div>

  );

}
