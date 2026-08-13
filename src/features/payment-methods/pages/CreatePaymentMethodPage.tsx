import {
  useNavigate,
} from "react-router-dom";

import {
  PaymentMethodForm,
} from "../components/PaymentMethodForm";

import {
  paymentMethodService,
} from "../services/payment-method.service";

import type {
  PaymentMethodFormData,
} from "../types/payment-method.types";

import {
  storeContext,
} from "@/core/store/store.context";

export function CreatePaymentMethodPage() {

  const navigate =
    useNavigate();

  function submit(
    data: PaymentMethodFormData,
  ) {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    paymentMethodService.createPaymentMethod(
      context.tenantId,
      context.storeId,
      data,
    );

    navigate(
      "/payment-methods",
    );
  }

  return (
    <PaymentMethodForm
      onSubmit={
        submit
      }
    />
  );
}
