import type {
  Brand,
} from "../types/brand.types";


import type {
  IBrandRepository,
} from "./brand.repository";



class InMemoryBrandRepository
  implements IBrandRepository {



  private brands: Brand[] = [];



  findAll(): Brand[] {

    return this.brands;

  }



  findById(
    id: string,
  ): Brand | undefined {

    return this.brands.find(
      (brand) =>
        brand.id === id,
    );

  }



  create(
    brand: Brand,
  ): Brand {

    this.brands.push(
      brand,
    );

    return brand;

  }



  update(
    id: string,
    updates: Partial<Brand>,
  ): Brand | undefined {


    const index =
      this.brands.findIndex(
        (brand) =>
          brand.id === id,
      );



    if (index === -1) {

      return undefined;

    }



    this.brands[index] = {

      ...this.brands[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };



    return this.brands[index];

  }



  delete(
    id: string,
  ): boolean {


    const index =
      this.brands.findIndex(
        (brand) =>
          brand.id === id,
      );



    if (index === -1) {

      return false;

    }



    this.brands.splice(
      index,
      1,
    );


    return true;

  }


}



export const inMemoryBrandRepository =
  new InMemoryBrandRepository();