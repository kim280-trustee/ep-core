import {
  useEffect,
} from "react";


import {
  useNavigate,
} from "react-router-dom";


import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";


import {
  PurchaseOrderTable,
} from "../components/PurchaseOrderTable";



export default function PurchaseOrdersPage() {


  const navigate = useNavigate();


  const {

    orders,

    loadOrders,

  } = usePurchaseOrders();



  useEffect(() => {

    loadOrders();

  }, [loadOrders]);



  return (

    <div>


      <h1>

        Purchase Orders

      </h1>



      <button

        onClick={() =>

          navigate(
            "/purchasing/create",
          )

        }

      >

        Create Purchase Order

      </button>



      <PurchaseOrderTable

        orders={orders}

      />


    </div>

  );

}