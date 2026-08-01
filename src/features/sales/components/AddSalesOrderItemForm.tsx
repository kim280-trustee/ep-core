import {
  useState,
} from "react";


import {
  useSalesOrders,
} from "../hooks/useSalesOrders";



export default function AddSalesOrderItemForm() {


  const {

    orders,

    addItem,

  } = useSalesOrders();



  const [orderId, setOrderId] = useState("");

  const [productId, setProductId] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [unitPrice, setUnitPrice] = useState(0);





  function handleSubmit() {


    addItem(

      orderId,

      {

        id:

          crypto.randomUUID(),


        salesOrderId:

          orderId,


        productId,


        quantity,


        unitPrice,


        discountAmount:

          0,


        taxRate:

          0,


        lineTotal:

          quantity *

          unitPrice,


      },

    );



    setProductId("");

    setQuantity(1);

    setUnitPrice(0);


  }





  return (

    <div>


      <h2>

        Add Sales Item

      </h2>



      <select

        value={orderId}

        onChange={(e) =>

          setOrderId(

            e.target.value,

          )

        }

      >

        <option value="">

          Select Order

        </option>



        {

          orders.map((order) => (


            <option

              key={order.id}

              value={order.id}

            >

              {order.orderNumber}

            </option>


          ))

        }


      </select>




      <input

        placeholder="Product ID"

        value={productId}

        onChange={(e) =>

          setProductId(

            e.target.value,

          )

        }

      />




      <input

        type="number"

        placeholder="Quantity"

        value={quantity}

        onChange={(e) =>

          setQuantity(

            Number(

              e.target.value,

            ),

          )

        }

      />




      <input

        type="number"

        placeholder="Unit Price"

        value={unitPrice}

        onChange={(e) =>

          setUnitPrice(

            Number(

              e.target.value,

            ),

          )

        }

      />




      <button

        onClick={handleSubmit}

      >

        Add Item

      </button>


    </div>

  );

}