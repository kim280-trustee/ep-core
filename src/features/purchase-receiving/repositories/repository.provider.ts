/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Purchase Receiving Module
 * ------------------------------------------------------------
 * Repository Provider
 * ============================================================
 */


import type {
  GoodsReceiptRepository,
} from "./goods-receipt.repository";


import {
  inMemoryGoodsReceiptRepository,
} from "./in-memory.goods-receipt.repository";



let repository: GoodsReceiptRepository =

  inMemoryGoodsReceiptRepository;





export function getGoodsReceiptRepository():

GoodsReceiptRepository {

  return repository;

}





export function setGoodsReceiptRepository(

  implementation: GoodsReceiptRepository,

): void {

  repository = implementation;

}