import {
  useState,
} from "react";


import {
  warehouseService,
} from "../services/warehouse.service";


export function useWarehouseActions() {


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<Error | null>(null);


  async function removeWarehouse(
    id: string,
  ) {

    setLoading(true);

    setError(null);


    try {

      return await warehouseService.deleteWarehouse(
        id,
      );

    } catch (
      caughtError
    ) {

      const nextError =
        caughtError instanceof Error
          ? caughtError
          : new Error(
              "Failed to delete warehouse.",
            );


      setError(
        nextError,
      );


      throw nextError;

    } finally {

      setLoading(false);

    }

  }


  return {

    removeWarehouse,

    loading,

    error,

  };

}
