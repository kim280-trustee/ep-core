import {
  useState,
} from "react";


import {
  customerService,
} from "../services/customer.service";



export function useCustomers() {


  const [
    customers,
    setCustomers,
  ] = useState(
    customerService.getCustomers(),
  );



  function refresh() {

    setCustomers(
      customerService.getCustomers(),
    );

  }



  function removeCustomer(
    id: string,
  ) {


    customerService.deleteCustomer(
      id,
    );


    refresh();

  }



  return {

    customers,

    refresh,

    removeCustomer,

  };

}