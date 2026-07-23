import type {
  Brand,
} from "../types/brand.types";


export interface IBrandRepository {


  findAll(): Brand[];


  findById(
    id: string,
  ): Brand | undefined;



  create(
    brand: Brand,
  ): Brand;



  update(
    id: string,
    updates: Partial<Brand>,
  ): Brand | undefined;



  delete(
    id: string,
  ): boolean;

}