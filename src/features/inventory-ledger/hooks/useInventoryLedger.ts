import {
  useState,
} from "react";


import {
  inventoryLedgerService,
} from "../services/inventory-ledger.service";



export function useInventoryLedger() {


  const [

    ledger,

    setLedger,

  ] = useState(

    inventoryLedgerService.getLedger(),

  );



  function refresh() {


    setLedger(

      inventoryLedgerService.getLedger(),

    );

  }



  return {


    ledger,


    refresh,


  };

}