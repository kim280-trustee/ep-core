import {
  useState,
} from "react";

import type {
  StockAdjustment,
} from "../types/stock-adjustment.types";


interface Props {

  productId: string;

  onSubmit: (
    adjustment: StockAdjustment,
  ) => void;

  onClose: () => void;

}



export function StockAdjustmentDialog({

  productId,

  onSubmit,

  onClose,

}: Props) {


  const [
    quantity,
    setQuantity,
  ] = useState(0);


  const [
    adjustmentType,
    setAdjustmentType,
  ] = useState<
    "INCREASE" | "DECREASE"
  >("INCREASE");


  const [
    reason,
    setReason,
  ] = useState<
    StockAdjustment["reason"]
  >("MANUAL");



  function handleSubmit() {


    const adjustment: StockAdjustment = {

      id:
        crypto.randomUUID(),

      tenantId:
        "default",

      storeId:
        "default",

      productId,

      quantity,

      adjustmentType,

      reason,

      adjustedBy:
        "system",

      adjustedAt:
        new Date().toISOString(),

    };


    onSubmit(adjustment);

  }



  return (

    <div className="rounded border p-4 space-y-4">


      <h2 className="text-lg font-semibold">

        Stock Adjustment

      </h2>



      <input

        type="number"

        value={quantity}

        onChange={(e) =>
          setQuantity(
            Number(e.target.value),
          )
        }

        className="border p-2"

      />



      <select

        value={adjustmentType}

        onChange={(e) =>
          setAdjustmentType(
            e.target.value as
            "INCREASE" |
            "DECREASE",
          )
        }

        className="border p-2"

      >

        <option value="INCREASE">
          Increase
        </option>

        <option value="DECREASE">
          Decrease
        </option>


      </select>




      <select

        value={reason}

        onChange={(e) =>
          setReason(
            e.target.value as StockAdjustment["reason"],
          )
        }

        className="border p-2"

      >

        <option value="MANUAL">
          Manual
        </option>

        <option value="DAMAGED">
          Damaged
        </option>

        <option value="EXPIRED">
          Expired
        </option>

        <option value="LOST">
          Lost
        </option>

        <option value="FOUND">
          Found
        </option>

        <option value="STOCK_COUNT">
          Stock Count
        </option>


      </select>




      <div className="flex gap-2">


        <button

          onClick={handleSubmit}

          className="border px-4 py-2"

        >

          Save

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