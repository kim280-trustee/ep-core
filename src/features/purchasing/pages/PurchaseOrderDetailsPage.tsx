import {
  useParams,
} from "react-router-dom";


import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";


import {
  PurchaseOrderSummary,
} from "../components/PurchaseOrderSummary";


import {
  PurchaseOrderItemTable,
} from "../components/PurchaseOrderItemTable";


import {
  PurchaseOrderItemForm,
} from "../components/PurchaseOrderItemForm";


import {
  PurchaseOrderActions,
} from "../components/PurchaseOrderActions";



export default function PurchaseOrderDetailsPage() {


  const {

    id,

  } = useParams();



  const {

    getOrderById,

  } = usePurchaseOrders();



  const order =

    id

      ? getOrderById(id)

      : undefined;



  if (!order) {


    return (

      <div>

        Purchase Order Not Found

      </div>

    );

  }



  return (

    <div>


      <h1>

        Purchase Order Details

      </h1>



      <div>


        <p>

          Order Number:

          {" "}

          {order.orderNumber}

        </p>



        <p>

          Supplier:

          {" "}

          {order.supplierId}

        </p>



        <p>

          Warehouse:

          {" "}

          {order.warehouseId}

        </p>



        <p>

          Status:

          {" "}

          {order.status}

        </p>


      </div>




      <hr />



      <PurchaseOrderActions

        order={order}

      />



      <hr />



      <PurchaseOrderItemForm

        orderId={order.id}

      />



      <hr />



      <PurchaseOrderItemTable

        items={order.items}

      />



      <hr />



      <PurchaseOrderSummary

        order={order}

      />



    </div>

  );

}