import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  TaxForm,
} from "../components/TaxForm";


import {
  taxService,
} from "../services/tax.service";



export function EditTaxPage() {


  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();



  const foundTax =
    id
      ? taxService.getTaxById(id)
      : undefined;



  if (!foundTax) {

    return (

      <div
        className="p-6"
      >

        Tax not found

      </div>

    );

  }



  const tax =
    foundTax;



  function handleSubmit(

    data: Parameters<
      typeof taxService.createTax
    >[0],

  ) {


    taxService.updateTax(

      tax.id,

      {

        name:
          data.name,


        rate:
          data.rate,


        country:
          data.country,


        currency:
          data.currency,

      },

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

        Edit Tax

      </h1>



      <TaxForm

        defaultValues={{

          name:
            tax.name,


          rate:
            tax.rate,


          country:
            tax.country,


          currency:
            tax.currency,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}