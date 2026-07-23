import {
  useNavigate,
} from "react-router-dom";


import {
  SupplierForm,
} from "../components/SupplierForm";


import {
  supplierService,
} from "../services/supplier.service";



export function CreateSupplierPage() {


  const navigate =
    useNavigate();



  function handleSubmit(

    data: Parameters<
      typeof supplierService.createSupplier
    >[0],

  ) {


    supplierService.createSupplier(

      data,

      "default-tenant",

      "default-store",

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

        Create Supplier

      </h1>



      <SupplierForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}