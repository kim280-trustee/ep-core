import {
  usePosSalesStore,
} from "../store/pos-sales.store";


import {
  saleService,
} from "../services/sale.service";



export function CheckoutPanel() {


  const items =
    usePosSalesStore(
      (state) =>
        state.items,
    );


  const tenantId =
    usePosSalesStore(
      (state) =>
        state.tenantId,
    );


  const storeId =
    usePosSalesStore(
      (state) =>
        state.storeId,
    );


  const warehouseId =
    usePosSalesStore(
      (state) =>
        state.warehouseId,
    );


  const customerId =
    usePosSalesStore(
      (state) =>
        state.customerId,
    );


  const clearCart =
    usePosSalesStore(
      (state) =>
        state.clearCart,
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



  function completeSale() {


    if (!warehouseId) {

      throw new Error(
        "Warehouse is required before completing sale.",
      );

    }



    const sale =

      saleService.createSale({

        tenantId,

        storeId,

        warehouseId,

        customerId,

      });



    items.forEach(

      (item) => {

        saleService.addItem(

          sale.id,

          item,

        );

      },

    );



    saleService.completeSale(

      sale.id,

    );



    clearCart();

  }



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

        onClick={completeSale}

      >

        Complete Sale

      </button>


    </div>

  );

}