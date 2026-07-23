import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  paymentMethodSchema,
} from "../validators/payment-method.schema";

import type {
  PaymentMethodFormInput,
} from "../validators/payment-method.schema";

interface PaymentMethodFormProps {

  defaultValues?: Partial<PaymentMethodFormInput>;

  onSubmit: (
    data: PaymentMethodFormInput,
  ) => void;

}

export function PaymentMethodForm({

  defaultValues,

  onSubmit,

}: PaymentMethodFormProps) {

  const {

    register,

    handleSubmit,

    formState: {
      errors,
    },

  } = useForm<PaymentMethodFormInput>({

    resolver:
      zodResolver(paymentMethodSchema),

    defaultValues,

  });

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="
        space-y-4
        max-w-xl
      "
    >

      <input
        {...register("name")}
        placeholder="Payment method"
        className="border rounded p-2 w-full"
      />

      {errors.name && (
        <p className="text-red-600">
          {errors.name.message}
        </p>
      )}

      <input
        {...register("code")}
        placeholder="Code"
        className="border rounded p-2 w-full"
      />

      <select
        {...register("type")}
        className="border rounded p-2 w-full"
      >

        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="qr">QR</option>
        <option value="mobile_money">Mobile Money</option>
        <option value="other">Other</option>

      </select>

      <label className="flex gap-2">

        <input
          type="checkbox"
          {...register("isDefault")}
        />

        Default

      </label>

      <label className="flex gap-2">

        <input
          type="checkbox"
          {...register("isActive")}
        />

        Active

      </label>

      <button
        type="submit"
        className="
          bg-black
          text-white
          px-5
          py-2
          rounded
        "
      >

        Save Payment Method

      </button>

    </form>

  );

}