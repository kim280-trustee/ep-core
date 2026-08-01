import {
  z,
} from "zod";



export const supplierSchema = z.object({


  name:

    z.string()

      .min(

        2,

        "Supplier name must contain at least 2 characters",

      ),



  contactPerson:

    z.string()

      .optional(),




  phone:

    z.string()

      .optional(),




  email:

    z.string()

      .email()

      .optional()

      .or(z.literal("")),




  address:

    z.string()

      .optional(),




  taxId:

    z.string()

      .optional(),




  paymentTerms:

    z.string()

      .optional(),



});





export type SupplierFormInput =

  z.infer<

    typeof supplierSchema

  >;