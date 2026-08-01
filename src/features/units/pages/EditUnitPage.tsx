/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Edit Unit Page
 * ============================================================
 */

import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  UnitForm,
} from "../components/UnitForm";


import {
  useUnits,
} from "../hooks/useUnits";



export function EditUnitPage() {


  const navigate =
    useNavigate();



  const {
    id,
  } = useParams();




  const {

    units,

    updateUnitById,

  } =
  useUnits();





  const existingUnit =

    units.find(

      (item) =>

        item.id === id,

    );





  if (!existingUnit) {


    return (

      <div className="p-6">

        Unit not found

      </div>

    );

  }





  const unit = existingUnit;





  function handleSubmit(

    data: Parameters<
      typeof updateUnitById
    >[1],

  ) {


    updateUnitById(

      unit.id,

      {


        name:
          data.name,


        symbol:
          data.symbol,


        description:
          data.description ?? null,


      },

    );



    navigate("/units");


  }





  return (

    <div className="p-6">


      <h1

        className="
          text-2xl
          font-bold
          mb-6
        "

      >

        Edit Unit

      </h1>





      <UnitForm


        defaultValues={{


          name:
            unit.name,


          symbol:
            unit.symbol,


          description:
            unit.description ?? undefined,


        }}



        onSubmit={handleSubmit}


      />


    </div>

  );


}