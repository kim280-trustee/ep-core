import {
  usePosSalesStore,
} from "../store/pos-sales.store";


export function Cart() {


  const items =
    usePosSalesStore(
      (state) =>
        state.items,
    );


  const removeItem =
    usePosSalesStore(
      (state) =>
        state.removeItem,
    );


  const subtotal =
    usePosSalesStore(
      (state) =>
        state.getSubtotal(),
    );


  const tax =
    usePosSalesStore(
      (state) =>
        state.getTaxAmount(),
    );


  const total =
    usePosSalesStore(
      (state) =>
        state.getTotal(),
    );



  return (

    <div>


      <h2 className="font-medium">
        Cart
      </h2>



      <div className="mt-4 space-y-3">


        {
          items.length === 0 && (

            <p className="text-gray-600">
              Cart is empty.
            </p>

          )
        }



        {
          items.map(

            (item) => (

              <div

                key={item.id}

                className="flex items-center justify-between rounded border p-3"

              >


                <div>

                  <p className="font-medium">

                    Product:

                    {" "}

                    {item.productId}

                  </p>


                  <p className="text-sm text-gray-600">

                    Qty:

                    {" "}

                    {item.quantity}

                    {" × "}

                    {item.unitPrice}

                  </p>


                </div>



                <button

                  className="text-sm text-red-600"

                  onClick={() =>

                    removeItem(

                      item.productId,

                    )

                  }

                >

                  Remove

                </button>


              </div>

            ),

          )
        }


      </div>



      <div className="mt-6 border-t pt-4">


        <p>
          Subtotal: {subtotal}
        </p>


        <p>
          Tax: {tax}
        </p>


        <p className="font-semibold">
          Total: {total}
        </p>


      </div>


    </div>

  );

}