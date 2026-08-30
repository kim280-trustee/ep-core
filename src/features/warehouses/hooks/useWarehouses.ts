import {
  useEffect,
  useState,
} from "react";


import {
  warehouseService,
} from "../services/warehouse.service";


import type {
  Warehouse,
} from "../types/warehouse.types";



export function useWarehouses() {


  const [warehouses, setWarehouses] =
    useState<Warehouse[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<Error | null>(null);



  async function loadWarehouses() {

    setLoading(true);

    setError(null);


    try {

      const result =
        await warehouseService.getWarehouses();


      setWarehouses(
        result,
      );

    } catch (
      caughtError
    ) {

      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error(
              "Failed to load warehouses.",
            ),
      );

    } finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    void loadWarehouses();

  }, []);



  return {

    warehouses,

    loading,

    error,

    reload:
      loadWarehouses,

  };

}
