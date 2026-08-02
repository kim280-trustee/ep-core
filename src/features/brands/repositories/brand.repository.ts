/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Module
 * ------------------------------------------------------------
 * Brand Repository Contract
 * ============================================================
 */


import type {

  Brand,

  CreateBrandDto,

  UpdateBrandDto,

} from "../types/brand.types";






export interface IBrandRepository {



  findAll(): Brand[];





  findById(

    id:string,

  ): Brand | undefined;





  findByCode(

    code:string,

  ): Brand | undefined;





  existsByCode(

    code:string,

  ): boolean;





  create(

    tenantId:string,

    storeId:string,

    data:CreateBrandDto,

  ): Brand;





  update(

    id:string,

    updates:UpdateBrandDto,

  ): Brand | undefined;





  delete(

    id:string,

  ): boolean;



}