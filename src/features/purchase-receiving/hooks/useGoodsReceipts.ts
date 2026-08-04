/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Purchase Receiving Module
 * ------------------------------------------------------------
 * Goods Receipt Hooks
 * ============================================================
 */

import {
  useCallback,
  useState,
} from "react";


import {
  goodsReceiptService,
} from "../services/goods-receipt.service";


import type {
  GoodsReceipt,
} from "../types/goods-receipt.types";



export function useGoodsReceipts() {


  const [
    receipts,
    setReceipts,
  ] = useState<GoodsReceipt[]>([]);



  const [
    loading,
    setLoading,
  ] = useState(false);



  const [
    error,
    setError,
  ] = useState<string | null>(null);





  const loadReceipts = useCallback(
    () => {

      try {

        setLoading(true);

        setError(null);


        const data =
          goodsReceiptService.getReceipts();


        setReceipts(
          data,
        );


      } catch (err) {

        setError(

          err instanceof Error

            ? err.message

            : "Unable to load receipts",

        );


      } finally {

        setLoading(false);

      }


    },
    [],
  );







  const getById = useCallback(
    (
      id: string,
    ) => {


      return goodsReceiptService.getReceiptById(
        id,
      );


    },
    [],
  );







  const create = useCallback(
    (
      input: any,
    ) => {


      const receipt =

        goodsReceiptService.createReceipt(
          input,
        );



      setReceipts(

        current => [

          ...current,

          receipt,

        ],

      );



      return receipt;


    },
    [],
  );








  return {


    receipts,


    loading,


    error,


    loadReceipts,


    refresh:

      loadReceipts,


    getById,


    create,


  };


}