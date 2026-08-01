import {
  useState,
} from "react";


import {
  useSalesOrders,
} from "../hooks/useSalesOrders";



export default function CreateSalesOrderForm() {


  const {

    createDraft,

  } = useSalesOrders();



  const [tenantId, setTenantId] = useState("");

  const [storeId, setStoreId] = useState("");

  const [warehouseId, setWarehouseId] = useState("");





  function handleSubmit() {


    createDraft({

      tenantId,

      storeId,

      warehouseId,

    });



    setTenantId("");

    setStoreId("");

    setWarehouseId("");

  }





  return (

    <div>


      <h2>

        Create Sales Order

      </h2>



      <input

        placeholder="Tenant ID"

        value={tenantId}

        onChange={(e) =>

          setTenantId(e.target.value)

        }

      />



      <input

        placeholder="Store ID"

        value={storeId}

        onChange={(e) =>

          setStoreId(e.target.value)

        }

      />



      <input

        placeholder="Warehouse ID"

        value={warehouseId}

        onChange={(e) =>

          setWarehouseId(e.target.value)

        }

      />



      <button

        onClick={handleSubmit}

      >

        Create Order

      </button>


    </div>

  );

}