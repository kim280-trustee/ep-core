import {
  useNavigate,
} from "react-router-dom";

import {
  CustomerForm,
} from "../components/CustomerForm";

import {
  customerService,
} from "../services/customer.service";

import {
  storeContext,
} from "../../../core/store/store.context";

export function CreateCustomerPage() {
  const navigate =
    useNavigate();

  function handleSubmit(
    data: Parameters<
      typeof customerService.createCustomer
    >[0],
  ) {
    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    customerService.createCustomer(
      data,
      context.tenantId,
      context.storeId,
    );

    navigate("/customers");
  }

  return (
    <div className="p-6">
      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Create Customer
      </h1>

      <CustomerForm
        onSubmit={handleSubmit}
      />
    </div>
  );
}
