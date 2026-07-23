import {
  useState,
} from "react";


import {
  inventoryTransactionService,
} from "../services/inventory-transaction.service";



export function useInventoryTransactions() {


  const [

    transactions,

    setTransactions,

  ] = useState(

    inventoryTransactionService.getTransactions(),

  );





  function refresh() {


    setTransactions(

      inventoryTransactionService.getTransactions(),

    );


  }





  return {


    transactions,


    refresh,


  };


}