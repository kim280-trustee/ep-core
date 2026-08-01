/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Module
 * ------------------------------------------------------------
 * Brand Business Service
 * ============================================================
 */


import {

  brandRepository,

} from "../repositories";



import {

  brandSchema,

} from "../validators/brand.schema";



import {

  BrandStatus,

} from "../types/brand.types";



import type {

  Brand,

  CreateBrandDto,

  UpdateBrandDto,

} from "../types/brand.types";







class BrandService {






  private generateId():string {


    return crypto.randomUUID();


  }









  getBrands():Brand[]{


    return brandRepository.findAll();


  }









  getBrandById(

    id:string,

  ):Brand | undefined {


    return brandRepository.findById(

      id,

    );


  }









  createBrand(


    input:CreateBrandDto,


    tenantId:string,


    storeId:string,


  ):Brand {



    const validated =


      brandSchema.parse(

        input,

      );








    const duplicate =


      this.getBrands()

        .find(


          brand =>


            brand.tenantId === tenantId &&


            brand.storeId === storeId &&


            brand.name.toLowerCase() ===

            validated.name.toLowerCase(),



        );







    if(duplicate){


      throw new Error(

        "Brand with this name already exists.",

      );


    }









    const now =


      new Date().toISOString();









    const brand:Brand = {



      id:


        this.generateId(),



      tenantId,



      storeId,



      name:


        validated.name,



      description:


        validated.description ?? null,



      status:


        BrandStatus.ACTIVE,



      createdAt:


        now,



      updatedAt:


        now,



    };








    return brandRepository.create(

      brand,

    );



  }









  updateBrand(


    id:string,


    updates:UpdateBrandDto,


  ):Brand | undefined {



    return brandRepository.update(


      id,


      {


        ...updates,


        updatedAt:


          new Date().toISOString(),


      },


    );


  }









  deleteBrand(

    id:string,

  ):boolean {



    return brandRepository.delete(

      id,

    );


  }






}








export const brandService =


  new BrandService();