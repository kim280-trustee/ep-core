import type {
  Tax,
} from "../types/tax.types";


export interface ITaxRepository {


  findAll(): Tax[];


  findById(
    id: string,
  ): Tax | undefined;



  create(
    tax: Tax,
  ): Tax;



  update(
    id: string,
    updates: Partial<Tax>,
  ): Tax | undefined;



  delete(
    id: string,
  ): boolean;

}