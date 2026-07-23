import {
  useState,
} from "react";


import {
  saleService,
} from "../services/sale.service";



export function useSales() {


  const [

    sales,

    setSales,

  ] = useState(

    saleService.getSales(),

  );



  function refresh() {


    setSales(

      saleService.getSales(),

    );

  }



  return {


    sales,


    refresh,


  };

}