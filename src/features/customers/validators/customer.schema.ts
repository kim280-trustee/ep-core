import {
  z,
} from "zod";


export const customerSchema = z.object({

  name: z
    .string()
    .min(
      2,
      "Customer name must contain at least 2 characters",
    ),


  phone: z
    .string()
    .optional(),


  email: z
    .string()
    .email(
      "Invalid email address",
    )
    .optional()
    .or(
      z.literal(""),
    ),


  address: z
    .string()
    .optional(),


  customerType: z.enum([
    "regular",
    "wholesale",
  ]),


  creditLimit: z
    .number()
    .min(
      0,
    )
    .optional(),

});


export type CustomerFormInput =
  z.infer<
    typeof customerSchema
  >;