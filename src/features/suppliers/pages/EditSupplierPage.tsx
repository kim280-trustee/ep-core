import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  SupplierForm,
} from "../components/SupplierForm";


import {
  supplierService,
} from "../services/supplier.service";


import type {
  SupplierFormInput,
} from "../validators/supplier.schema";



export function EditSupplierPage() {


  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();



  const foundSupplier =
    id
      ? supplierService.getSupplierById(id)
      : undefined;



  if (!foundSupplier) {

    return (

      <div className="p-6">

        Supplier not found

      </div>

    );

  }



  const supplier = foundSupplier;



  function handleSubmit(

    data: SupplierFormInput,

  ) {


    supplierService.updateSupplier(

      supplier.id,

      {

        name:
          data.name,


        contactPerson:
          data.contactPerson ?? null,


        phone:
          data.phone ?? null,


        email:
          data.email ?? null,


        address:
          data.address ?? null,


        taxId:
          data.taxId ?? null,


        paymentTerms:
          data.paymentTerms ?? null,


      },

    );


    navigate("/suppliers");

  }



  return (

    <div className="p-6">


      <h1 className="text-2xl font-bold mb-6">

        Edit Supplier

      </h1>



      <SupplierForm

        defaultValues={{

          name:
            supplier.name,


          contactPerson:
            supplier.contactPerson ?? undefined,


          phone:
            supplier.phone ?? undefined,


          email:
            supplier.email ?? undefined,


          address:
            supplier.address ?? undefined,


          taxId:
            supplier.taxId ?? undefined,


          paymentTerms:
            supplier.paymentTerms ?? undefined,


        }}


        onSubmit={
          handleSubmit
        }

      />


    </div>

  );

}