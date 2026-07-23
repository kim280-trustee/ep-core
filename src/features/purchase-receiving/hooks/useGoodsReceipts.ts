import {
  useState,
} from "react";


import {
  goodsReceiptService,
} from "../services/goods-receipt.service";



export function useGoodsReceipts() {


  const [

    receipts,

    setReceipts,

  ] = useState(

    goodsReceiptService.getReceipts(),

  );



  function refresh() {


    setReceipts(

      goodsReceiptService.getReceipts(),

    );

  }



  return {


    receipts,


    refresh,


  };


}