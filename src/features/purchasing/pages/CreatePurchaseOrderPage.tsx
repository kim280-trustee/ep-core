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
  storeContext,
} from "../../../core/store/store.context";

export default function CreatePurchaseOrderPage() {
  const navigate =
    useNavigate();

  const {
    createDraft,
  } = usePurchaseOrders();

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

  function handleSubmit() {
    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    const order =
      createDraft({
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
  }

  return (
    <div>
      <h1>
        Create Purchase Order
      </h1>

      <div>
        <label>
          Supplier ID
        </label>

        <input
          value={supplierId}
          onChange={(event) =>
            setSupplierId(
              event.target.value,
            )
          }
        />
      </div>

      <div>
        <label>
          Warehouse ID
        </label>

        <input
          value={warehouseId}
          onChange={(event) =>
            setWarehouseId(
              event.target.value,
            )
          }
        />
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

      <button
        onClick={handleSubmit}
      >
        Create Draft
      </button>
    </div>
  );
}
