import {
  inMemorySaleRepository,
} from "./in-memory.sale.repository";


import type {
  SaleRepository,
} from "./sale.repository";


let saleRepository: SaleRepository =
  inMemorySaleRepository;



export function getSaleRepository() {

  return saleRepository;

}



export function setSaleRepository(
  repository: SaleRepository,
) {

  saleRepository = repository;

}