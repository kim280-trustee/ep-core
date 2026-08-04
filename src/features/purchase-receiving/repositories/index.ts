/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Purchase Receiving Module
 * ------------------------------------------------------------
 * Repository Exports
 * ============================================================
 */


export * from "./goods-receipt.repository";


export * from "./in-memory.goods-receipt.repository";


export * from "./repository.provider";



import {
  getGoodsReceiptRepository,
} from "./repository.provider";



export const goodsReceiptRepository =
  getGoodsReceiptRepository();