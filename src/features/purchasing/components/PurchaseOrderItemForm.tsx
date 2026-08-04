import {
  useState,
} from "react";


import {
  usePurchaseOrderStore,
} from "../store/purchase-order.store";



interface PurchaseOrderItemFormProps {

  orderId: string;

}



export function PurchaseOrderItemForm({

  orderId,

}: PurchaseOrderItemFormProps) {



  const {

    addItem,

  } = usePurchaseOrderStore();



  const [

    productId,

    setProductId,

  ] = useState("");



  const [

    quantity,

    setQuantity,

  ] = useState(1);



  const [

    unitCost,

    setUnitCost,

  ] = useState(0);



  const [

    taxRate,

    setTaxRate,

  ] = useState(0);





  function handleSubmit() {


    const item = {


      id:

        crypto.randomUUID(),


      purchaseOrderId:

        orderId,


      productId,


      quantityOrdered:

        quantity,


      quantityReceived:

        0,


      unitCost,


      taxRate,


      lineTotal:

        quantity *

        unitCost,

    };



    addItem(

      orderId,

      item,

    );



    setProductId("");

    setQuantity(1);

    setUnitCost(0);

    setTaxRate(0);


  }





  return (

    <div>


      <h3>
        Add Purchase Item
      </h3>



      <div>

        <label>
          Product ID
        </label>


        <input

          value={productId}

          onChange={(event) =>

            setProductId(

              event.target.value,

            )

          }

        />

      </div>




      <div>

        <label>
          Quantity
        </label>


        <input

          type="number"

          value={quantity}

          onChange={(event) =>

            setQuantity(

              Number(event.target.value),

            )

          }

        />

      </div>




      <div>

        <label>
          Unit Cost
        </label>


        <input

          type="number"

          value={unitCost}

          onChange={(event) =>

            setUnitCost(

              Number(event.target.value),

            )

          }

        />

      </div>




      <div>

        <label>
          Tax Rate %
        </label>


        <input

          type="number"

          value={taxRate}

          onChange={(event) =>

            setTaxRate(

              Number(event.target.value),

            )

          }

        />

      </div>




      <button

        onClick={handleSubmit}

      >

        Add Item

      </button>



    </div>

  );

}