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


import type {

  Brand,

  CreateBrandDto,

  UpdateBrandDto,

} from "../types/brand.types";


import {

  BrandStatus,

} from "../types/brand.types";







class BrandService {






  getBrands():Brand[] {


    return brandRepository.findAll();


  }








  getBrandById(

    id:string,

  ):Brand | undefined {


    return brandRepository.findById(

      id,

    );


  }








  getActiveBrands():Brand[] {


    return this.getBrands()

      .filter(

        brand =>

          brand.status === BrandStatus.ACTIVE,

      );


  }








  getBrandStats(){


    const brands =

      this.getBrands();




    return {


      total:

        brands.length,



      active:

        brands.filter(

          brand =>

            brand.status === BrandStatus.ACTIVE,

        ).length,



      inactive:

        brands.filter(

          brand =>

            brand.status === BrandStatus.INACTIVE,

        ).length,


    };


  }








  createBrand(

    tenantId:string,

    storeId:string,

    input:CreateBrandDto,

  ):Brand {



    const validated =

      brandSchema.parse(

        input,

      );





    if(

      validated.code &&

      brandRepository.existsByCode(

        validated.code,

      )

    ){

      throw new Error(

        "Brand code already exists.",

      );

    }







    return brandRepository.create(

      tenantId,

      storeId,

      validated,

    );


  }








  updateBrand(

    id:string,

    updates:UpdateBrandDto,

  ):Brand | undefined {


    return brandRepository.update(

      id,

      updates,

    );


  }








  toggleStatus(

    brand:Brand,

  ):Brand {



    return {

      ...brand,


      status:

        brand.status === BrandStatus.ACTIVE

        ?

        BrandStatus.INACTIVE

        :

        BrandStatus.ACTIVE,


      updatedAt:

        new Date().toISOString(),

    };


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