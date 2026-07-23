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

      <div
        className="p-6"
      >

        Supplier not found

      </div>

    );

  }



  const supplier = foundSupplier;



  function handleSubmit(

    data: Parameters<
      typeof supplierService.createSupplier
    >[0],

  ) {


    supplierService.updateSupplier(

      supplier.id,

      {

        name:
          data.name,


        contactPerson:
          data.contactPerson,


        phone:
          data.phone,


        email:
          data.email,


        address:
          data.address,


        taxId:
          data.taxId,

      },

    );


    navigate("/suppliers");

  }



  return (

    <div
      className="p-6"
    >

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Edit Supplier

      </h1>



      <SupplierForm

        defaultValues={{

          name:
            supplier.name,


          contactPerson:
            supplier.contactPerson,


          phone:
            supplier.phone,


          email:
            supplier.email,


          address:
            supplier.address,


          taxId:
            supplier.taxId,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}