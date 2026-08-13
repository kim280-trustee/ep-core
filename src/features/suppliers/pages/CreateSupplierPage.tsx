import {
  useNavigate,
} from "react-router-dom";

import {
  SupplierForm,
} from "../components/SupplierForm";

import {
  useSuppliers,
} from "../hooks/useSuppliers";

import {
  storeContext,
} from "../../../core/store/store.context";

export function CreateSupplierPage() {
  const navigate =
    useNavigate();

  const {
    createSupplier,
  } = useSuppliers();

  function handleSubmit(
    data: Parameters<
      typeof createSupplier
    >[0],
  ) {
    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    createSupplier(
      data,
    );

    navigate(
      "/suppliers",
    );
  }

  return (
    <SupplierForm
      onSubmit={handleSubmit}
    />
  );
}
