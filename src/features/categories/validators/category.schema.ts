import {
  z,
} from "zod";


export const categorySchema = z.object({

  name: z
    .string()
    .min(
      2,
      "Category name must contain at least 2 characters",
    ),


  description: z
    .string()
    .optional(),

});


export type CategoryFormInput =
  z.infer<
    typeof categorySchema
  >;