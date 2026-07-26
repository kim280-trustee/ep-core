import {
  usePosSalesStore,
} from "../store/pos-sales.store";



export function CheckoutPanel() {


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

    <div className="rounded border p-4">


      <h2 className="font-medium">
        Checkout
      </h2>



      <div className="mt-4 space-y-2">


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



      <button

        className="mt-4 rounded bg-black px-4 py-2 text-white"

        disabled

      >

        Complete Sale

      </button>


    </div>

  );

}