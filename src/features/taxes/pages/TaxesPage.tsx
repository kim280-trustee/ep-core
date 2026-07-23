import {
  useState,
} from "react";


import {
  TaxToolbar,
} from "../components/TaxToolbar";


import {
  TaxTable,
} from "../components/TaxTable";


import {
  useTaxes,
} from "../hooks/useTaxes";



export function TaxesPage() {


  const {
    taxes,
    removeTax,
  } = useTaxes();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredTaxes =
    taxes.filter(
      (tax) =>
        tax.name
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

        Taxes

      </h1>



      <TaxToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <TaxTable

        taxes={filteredTaxes}

        onDelete={removeTax}

      />


    </div>

  );

}