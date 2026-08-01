import {
  useEffect,
} from "react";


import {
  useDashboardStore,
} from "../store";



export function useDashboard() {


  const store =

    useDashboardStore();



  useEffect(() => {


    store.loadDashboard();


  }, [store]);



  return store;


}