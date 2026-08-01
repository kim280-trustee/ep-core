import {
  useState,
} from "react";


import {
  useWarehouses,
} from "../hooks/useWarehouses";


import {
  WarehouseToolbar,
} from "../components/WarehouseToolbar";


import {
  WarehouseTable,
} from "../components/WarehouseTable";



export function WarehousesPage(){


  const {

    warehouses,

  } = useWarehouses();



  const [

    search,

    setSearch,

  ] = useState("");



  const filtered =

    warehouses.filter(

      warehouse =>

        warehouse.name
          .toLowerCase()
          .includes(

            search.toLowerCase()

          )

    );



  return (

    <div>


      <WarehouseToolbar

        search={
          search
        }

        onSearchChange={
          setSearch
        }

      />


      <WarehouseTable

        warehouses={
          filtered
        }

        onDelete={
          ()=>{}
        }

      />


    </div>

  );

}