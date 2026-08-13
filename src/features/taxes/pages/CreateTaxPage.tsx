import {
  useNavigate,
} from "react-router-dom";

import {
  TaxForm,
} from "../components/TaxForm";

import {
  taxService,
} from "../services/tax.service";

import type {
  TaxFormInput,
} from "../validators/tax.schema";

import {
  storeContext,
} from "@/core/store/store.context";

export function CreateTaxPage() {

  const navigate =
    useNavigate();

  function handleSubmit(
    data: TaxFormInput,
  ) {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    taxService.createTax(
      context.tenantId,
      context.storeId,
      data,
    );

    navigate(
      "/taxes",
    );
  }

  return (
    <TaxForm
      onSubmit={
        handleSubmit
      }
    />
  );
}
