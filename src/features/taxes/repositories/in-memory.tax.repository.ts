import {

  v4 as uuid,

} from "uuid";


import type {

  Tax,

  CreateTaxDto,

  UpdateTaxDto,

} from "../types/tax.types";


import type {

  TaxRepository,

} from "./tax.repository";



class InMemoryTaxRepository

implements TaxRepository {



  private taxes: Tax[] = [];



  findAll(): Tax[] {


    return this.taxes;


  }



  findById(

    id:string,

  ): Tax | undefined {


    return this.taxes.find(

      tax =>

        tax.id === id,

    );


  }



  create(

    tax:

      CreateTaxDto & {

        tenantId:string;

        storeId:string;

      },

  ): Tax {



    const newTax: Tax = {


      id:

        uuid(),



      status:

        "ACTIVE",



      createdAt:

        new Date(),



      updatedAt:

        new Date(),



      ...tax,



    };



    this.taxes.push(

      newTax,

    );



    return newTax;


  }



  update(

    id:string,

    tax:UpdateTaxDto,

  ): Tax | undefined {



    const existing =

      this.findById(

        id,

      );



    if(!existing){


      return undefined;


    }



    Object.assign(

      existing,

      tax,

      {


        updatedAt:

          new Date(),


      },


    );



    return existing;


  }



  delete(

    id:string,

  ): boolean {



    const index =

      this.taxes.findIndex(

        tax =>

          tax.id === id,

      );



    if(index === -1){


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