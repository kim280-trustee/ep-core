import {
  useNavigate,
} from "react-router-dom";


import {
  UnitForm,
} from "../components/UnitForm";


import {
  unitService,
} from "../services/unit.service";



export function CreateUnitPage() {


  const navigate =
    useNavigate();



  function handleSubmit(

    data: Parameters<
      typeof unitService.createUnit
    >[0],

  ) {


    unitService.createUnit(

      data,

      "default-tenant",

      "default-store",

    );


    navigate("/units");

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

        Create Unit

      </h1>



      <UnitForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}