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


  async function handleDelete(
    id: string,
  ) {

    const supplier =
      suppliers.find(
        item => item.id === id,
      );


    if (!supplier) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${supplier.name}?`,
      );


    if (!confirmed) {

      return;

    }


    await removeSupplier(id);

  }


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
          handleDelete
        }

      />


    </div>

  );

}