/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Add Sales Order Item Form
 * ============================================================
 */

import {
  useState,
} from "react";

import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

import {
  ProductSelector,
} from "./ProductSelector";

import {
  useProductsStore,
} from "@/features/products";


export default function AddSalesOrderItemForm() {


  const {
    orders,
    addItem,
  } = useSalesOrders();



  const products =
    useProductsStore(
      (state) => state.products,
    );



  const [orderId, setOrderId] =
    useState("");



  const [productId, setProductId] =
    useState("");



  const [quantity, setQuantity] =
    useState(1);



  function handleSubmit() {


    const product =
      products.find(
        (item) =>
          item.id === productId,
      );



    if (!product) {

      alert(
        "Please select a product",
      );

      return;

    }



    const taxRate =
      product.tax?.taxRate ?? 0;



    addItem(

      orderId,

      {

        id:
          crypto.randomUUID(),


        salesOrderId:
          orderId,


        productId:
          product.id,


        quantity,


        unitPrice:
          product.pricing.sellingPrice,


        discountAmount:
          0,


        taxRate,


        lineTotal:
          quantity *
          product.pricing.sellingPrice,

      },

    );



    setProductId("");

    setQuantity(1);

  }




  return (

    <div
      className="
      flex
      flex-col
      gap-4
      "
    >


      <h2>
        Add Sales Item
      </h2>



      <select

        value={orderId}

        onChange={(e)=>
          setOrderId(
            e.target.value,
          )
        }

        className="border p-2 rounded"

      >

        <option value="">
          Select Order
        </option>


        {
          orders.map(
            (order)=> (

              <option
                key={order.id}
                value={order.id}
              >

                {order.orderNumber}

              </option>

            ),
          )
        }


      </select>



      <ProductSelector

        value={productId}

        onChange={setProductId}

      />



      <input

        type="number"

        value={quantity}

        min={1}

        onChange={(e)=>
          setQuantity(
            Number(
              e.target.value,
            ),
          )
        }

        className="border p-2 rounded"

      />



      <button

        onClick={handleSubmit}

        className="
        bg-blue-600
        text-white
        p-2
        rounded
        "

      >

        Add Item

      </button>


    </div>

  );

}