import {
  useNavigate,
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



export function CreateSupplierPage() {


  const navigate =
    useNavigate();



  function handleSubmit(
    data: SupplierFormInput,
  ) {


    supplierService.createSupplier(

      "default-tenant",

      "default-store",

      data,

    );



    navigate(
      "/suppliers",
    );

  }



  return (

    <SupplierForm

      onSubmit={
        handleSubmit
      }

    />

  );

}