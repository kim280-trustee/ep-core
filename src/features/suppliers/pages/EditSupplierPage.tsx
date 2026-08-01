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


  const {
    id,
  } =
    useParams();


  const navigate =
    useNavigate();



  const supplier =
    id

      ? supplierService.getSupplierById(
          id,
        )

      : undefined;



  function handleSubmit(
    data: any,
  ) {


    if (!id) {

      return;

    }



    supplierService.updateSupplier(

      id,

      data,

    );



    navigate(
      "/suppliers",
    );

  }



  return (

    <SupplierForm

      defaultValues={
        supplier
      }

      onSubmit={
        handleSubmit
      }

    />

  );

}