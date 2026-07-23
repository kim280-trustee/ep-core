import {
  useNavigate,
} from "react-router-dom";


import {
  TaxForm,
} from "../components/TaxForm";


import {
  taxService,
} from "../services/tax.service";



export function CreateTaxPage() {


  const navigate =
    useNavigate();



  function handleSubmit(

    data: Parameters<
      typeof taxService.createTax
    >[0],

  ) {


    taxService.createTax(

      data,

      "default-tenant",

      "default-store",

    );


    navigate("/taxes");

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

        Create Tax

      </h1>



      <TaxForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}