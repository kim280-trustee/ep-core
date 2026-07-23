import {
  useNavigate,
} from "react-router-dom";

import {
  PaymentMethodForm,
} from "../components/PaymentMethodForm";

import {
  paymentMethodService,
} from "../services/payment-method.service";

export function CreatePaymentMethodPage() {

  const navigate =
    useNavigate();

  function handleSubmit(
    data: Parameters<
      typeof paymentMethodService.createPaymentMethod
    >[0],
  ) {

    paymentMethodService.createPaymentMethod(
      data,
      "default-tenant",
      "default-store",
    );

    navigate("/payment-methods");

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

        Create Payment Method

      </h1>

      <PaymentMethodForm
        onSubmit={handleSubmit}
      />

    </div>

  );

}