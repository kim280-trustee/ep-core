import {

  useEffect,

} from "react";


import {

  taxService,

} from "../services/tax.service";


import {

  useTaxStore,

} from "../store/tax.store";



export function useTaxes(){


 const {

  taxes,

  setTaxes,

 } = useTaxStore();



 useEffect(()=>{


  setTaxes(

    taxService.getTaxes()

  );


 },[setTaxes]);



 return {


  taxes,


 };


}