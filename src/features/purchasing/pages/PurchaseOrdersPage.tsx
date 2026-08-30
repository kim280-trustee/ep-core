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


import {
  storeContext,
} from "@/core/store/store.context";



export default function PurchaseOrdersPage() {


  const navigate = useNavigate();


  const {
    orders,
    loadOrders,
  } = usePurchaseOrders();


  const context =
    storeContext.getStore();


  useEffect(() => {

    if (!context?.tenantId) {

      return;

    }

    void loadOrders(
      context.tenantId,
    );

  }, [
    context?.tenantId,
    loadOrders,
  ]);


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
