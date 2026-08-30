import {
  Link,
  useParams,
} from "react-router-dom";


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


export function WarehouseDetailsPage() {


  const {
    id,
  } = useParams();


  const [
    warehouse,
    setWarehouse,
  ] = useState<
    Warehouse | undefined
  >();


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {

    async function loadWarehouse() {

      if (!id) {

        setLoading(false);

        return;

      }


      try {

        const result =
          await warehouseService.getWarehouseById(
            id,
          );


        setWarehouse(
          result,
        );

      } finally {

        setLoading(false);

      }

    }


    void loadWarehouse();

  }, [
    id,
  ]);


  if (loading) {

    return (
      <div>
        Loading warehouse...
      </div>
    );

  }


  if (!warehouse) {

    return (
      <div>
        Warehouse not found
      </div>
    );

  }


  return (

    <div>

      <h1>
        {warehouse.name}
      </h1>


      <p>
        Code: {warehouse.code}
      </p>


      <p>
        Status: {warehouse.status}
      </p>


      <p>
        Country: {warehouse.country}
      </p>


      <Link
        to={`/warehouses/${warehouse.id}/edit`}
      >
        Edit Warehouse
      </Link>


      {" "}


      <Link
        to="/warehouses"
      >
        Back to Warehouses
      </Link>

    </div>

  );

}
