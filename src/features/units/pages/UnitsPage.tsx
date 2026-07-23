import {
  useState,
} from "react";


import {
  UnitToolbar,
} from "../components/UnitToolbar";


import {
  UnitTable,
} from "../components/UnitTable";


import {
  useUnits,
} from "../hooks/useUnits";



export function UnitsPage() {


  const {
    units,
    removeUnit,
  } = useUnits();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredUnits =
    units.filter(
      (unit) =>
        unit.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );



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

        Units

      </h1>



      <UnitToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <UnitTable

        units={filteredUnits}

        onDelete={removeUnit}

      />


    </div>

  );

}