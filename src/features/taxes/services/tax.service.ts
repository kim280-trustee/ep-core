import {
  taxRepository,
} from "../repositories";


import type {
  Tax,
} from "../types/tax.types";


import type {
  TaxFormInput,
} from "../validators/tax.schema";



class TaxService {



  generateId(): string {

    return crypto.randomUUID();

  }



  getTaxes(): Tax[] {

    return taxRepository.findAll();

  }



  getTaxById(
    id: string,
  ): Tax | undefined {

    return taxRepository.findById(id);

  }



  createTax(

    input: TaxFormInput,

    tenantId: string,

    storeId: string,

  ): Tax {



    const now =
      new Date().toISOString();



    const tax: Tax = {

      id:
        this.generateId(),


      tenantId,


      storeId,


      name:
        input.name,


      rate:
        input.rate,


      country:
        input.country,


      currency:
        input.currency,


      status:
        "active",


      createdAt:
        now,


      updatedAt:
        now,

    };



    return taxRepository.create(
      tax,
    );

  }



  updateTax(

    id: string,

    updates: Partial<Tax>,

  ) {


    return taxRepository.update(
      id,
      updates,
    );

  }



  deleteTax(
    id: string,
  ): boolean {

    return taxRepository.delete(id);

  }


}



export const taxService =
  new TaxService();