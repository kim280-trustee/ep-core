/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Create Unit Page
 * ============================================================
 */


import {
  useNavigate,
} from "react-router-dom";


import {
  UnitForm,
} from "../components/UnitForm";


import {
  useUnits,
} from "../hooks/useUnits";



export function CreateUnitPage() {


  const navigate =
    useNavigate();



  const {

    createUnit,

  } =
  useUnits();






  function handleSubmit(

    data: Parameters<
      typeof createUnit
    >[0],

  ) {


    createUnit(data);



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

        Create Unit

      </h1>





      <UnitForm

        onSubmit={handleSubmit}

      />



    </div>

  );


}