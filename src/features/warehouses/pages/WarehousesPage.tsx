import {
  useState,
} from "react";


import {
  WarehouseToolbar,
} from "../components/WarehouseToolbar";


import {
  WarehouseTable,
} from "../components/WarehouseTable";


import {
  useWarehouses,
} from "../hooks/useWarehouses";



export function WarehousesPage() {


  const {
    warehouses,
    removeWarehouse,
  } = useWarehouses();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredWarehouses =
    warehouses.filter(
      (warehouse) =>
        warehouse.name
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

        Warehouses

      </h1>



      <WarehouseToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <WarehouseTable

        warehouses={filteredWarehouses}

        onDelete={removeWarehouse}

      />


    </div>

  );

}