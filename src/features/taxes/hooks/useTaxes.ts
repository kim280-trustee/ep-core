import {
  useState,
} from "react";


import {
  taxService,
} from "../services/tax.service";



export function useTaxes() {


  const [
    taxes,
    setTaxes,
  ] = useState(
    taxService.getTaxes(),
  );



  function refresh() {

    setTaxes(
      taxService.getTaxes(),
    );

  }



  function removeTax(
    id: string,
  ) {


    taxService.deleteTax(
      id,
    );


    refresh();

  }



  return {

    taxes,

    refresh,

    removeTax,

  };

}