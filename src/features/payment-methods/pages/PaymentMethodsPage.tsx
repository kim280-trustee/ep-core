import {
  useState,
} from "react";

import {
  PaymentMethodToolbar,
} from "../components/PaymentMethodToolbar";

import {
  PaymentMethodTable,
} from "../components/PaymentMethodTable";

import {
  usePaymentMethods,
} from "../hooks/usePaymentMethods";

export function PaymentMethodsPage() {

  const {
    paymentMethods,
    removePaymentMethod,
  } = usePaymentMethods();

  const [
    search,
    setSearch,
  ] = useState("");

  const filteredPaymentMethods =
    paymentMethods.filter(
      (paymentMethod) =>
        paymentMethod.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  return (

    <div className="p-6">

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Payment Methods

      </h1>

      <PaymentMethodToolbar
        search={search}
        onSearchChange={setSearch}
      />

      <PaymentMethodTable
        paymentMethods={filteredPaymentMethods}
        onDelete={removePaymentMethod}
      />

    </div>

  );

}