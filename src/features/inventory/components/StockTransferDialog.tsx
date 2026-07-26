import {
  useState,
} from "react";

import type {
  StockTransfer,
} from "../types/stock-transfer.types";


interface Props {

  productId: string;

  onSubmit: (
    transfer: StockTransfer,
  ) => void;

  onClose: () => void;

}



export function StockTransferDialog({

  productId,

  onSubmit,

  onClose,

}: Props) {


  const [
    quantity,
    setQuantity,
  ] = useState(0);


  const [
    fromStoreId,
    setFromStoreId,
  ] = useState("");


  const [
    toStoreId,
    setToStoreId,
  ] = useState("");



  function handleSubmit() {


    const transfer: StockTransfer = {

      id:
        crypto.randomUUID(),


      tenantId:
        "default",


      fromStoreId,


      toStoreId,


      productId,


      quantity,


      status:
        "PENDING",


      transferredBy:
        "system",


      transferredAt:
        new Date().toISOString(),

    };


    onSubmit(transfer);

  }



  return (

    <div className="rounded border p-4 space-y-4">


      <h2 className="text-lg font-semibold">

        Stock Transfer

      </h2>



      <input

        placeholder="From store"

        value={fromStoreId}

        onChange={(e) =>
          setFromStoreId(
            e.target.value,
          )
        }

        className="border p-2"

      />



      <input

        placeholder="To store"

        value={toStoreId}

        onChange={(e) =>
          setToStoreId(
            e.target.value,
          )
        }

        className="border p-2"

      />



      <input

        type="number"

        placeholder="Quantity"

        value={quantity}

        onChange={(e) =>
          setQuantity(
            Number(e.target.value),
          )
        }

        className="border p-2"

      />



      <div className="flex gap-2">


        <button

          onClick={handleSubmit}

          className="border px-4 py-2"

        >

          Transfer

        </button>



        <button

          onClick={onClose}

          className="border px-4 py-2"

        >

          Cancel

        </button>


      </div>


    </div>

  );

}