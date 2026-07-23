import {
  z,
} from "zod";


export const brandSchema = z.object({

  name: z
    .string()
    .min(
      2,
      "Brand name must contain at least 2 characters",
    ),


  description: z
    .string()
    .optional(),

});


export type BrandFormInput =
  z.infer<
    typeof brandSchema
  >;