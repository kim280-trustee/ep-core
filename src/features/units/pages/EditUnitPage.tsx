import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  UnitForm,
} from "../components/UnitForm";


import {
  unitService,
} from "../services/unit.service";



export function EditUnitPage() {


  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();



  const foundUnit =
    id
      ? unitService.getUnitById(id)
      : undefined;



  if (!foundUnit) {

    return (

      <div
        className="p-6"
      >

        Unit not found

      </div>

    );

  }



  const unit = foundUnit;



  function handleSubmit(

    data: Parameters<
      typeof unitService.createUnit
    >[0],

  ) {


    unitService.updateUnit(

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