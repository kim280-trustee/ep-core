import type {
  Tax,
} from "../types/tax.types";


import type {
  ITaxRepository,
} from "./tax.repository";



class InMemoryTaxRepository
  implements ITaxRepository {



  private taxes: Tax[] = [];



  findAll(): Tax[] {

    return this.taxes;

  }



  findById(
    id: string,
  ): Tax | undefined {

    return this.taxes.find(
      (tax) =>
        tax.id === id,
    );

  }



  create(
    tax: Tax,
  ): Tax {

    this.taxes.push(
      tax,
    );

    return tax;

  }



  update(
    id: string,
    updates: Partial<Tax>,
  ): Tax | undefined {


    const index =
      this.taxes.findIndex(
        (tax) =>
          tax.id === id,
      );



    if (index === -1) {

      return undefined;

    }



    this.taxes[index] = {

      ...this.taxes[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };



    return this.taxes[index];

  }



  delete(
    id: string,
  ): boolean {


    const index =
      this.taxes.findIndex(
        (tax) =>
          tax.id === id,
      );



    if (index === -1) {

      return false;

    }



    this.taxes.splice(
      index,
      1,
    );


    return true;

  }


}



export const inMemoryTaxRepository =
  new InMemoryTaxRepository();