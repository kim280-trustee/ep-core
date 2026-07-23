import {
  z,
} from "zod";


export const paymentMethodSchema =
  z.object({

    name: z
      .string()
      .min(
        2,
        "Payment method name is required",
      ),

    code: z
      .string()
      .min(
        2,
        "Payment method code is required",
      ),

    type: z.enum([
      "cash",
      "card",
      "bank_transfer",
      "qr",
      "mobile_money",
      "other",
    ]),

    isDefault:
      z.boolean(),

    isActive:
      z.boolean(),

  });


export type PaymentMethodFormInput =
  z.infer<
    typeof paymentMethodSchema
  >;