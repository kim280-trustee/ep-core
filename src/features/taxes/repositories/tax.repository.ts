import type {

  Tax,

  CreateTaxDto,

  UpdateTaxDto,

} from "../types/tax.types";



export interface TaxRepository {


  findAll():Tax[];



  findById(

    id:string,

  ):Tax | undefined;



  create(

    tax:

      CreateTaxDto & {

        tenantId:string;

        storeId:string;

      },

  ):Tax;



  update(

    id:string,

    tax:UpdateTaxDto,

  ):Tax | undefined;



  delete(

    id:string,

  ):boolean;


}