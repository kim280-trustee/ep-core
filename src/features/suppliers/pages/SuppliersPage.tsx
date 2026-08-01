import {
  useState,
} from "react";


import {
  useSuppliers,
} from "../hooks/useSuppliers";


import {
  SupplierToolbar,
} from "../components/SupplierToolbar";


import {
  SupplierTable,
} from "../components/SupplierTable";



export function SuppliersPage() {


  const {

    suppliers,

    removeSupplier,

  } =
    useSuppliers();



  const [
    search,
    setSearch,
  ] =
    useState("");



  const filtered =

    suppliers.filter(

      supplier =>

        supplier.name

          .toLowerCase()

          .includes(

            search.toLowerCase(),

          ),

    );



  return (

    <div>


      <SupplierToolbar

        search={
          search
        }

        onSearchChange={
          setSearch
        }

      />


      <SupplierTable

        suppliers={
          filtered
        }

        onDelete={
          removeSupplier
        }

      />


    </div>

  );

}