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
  BrandStatus,
} from "../types/brand.types";


import type {
  Brand,
} from "../types/brand.types";


import type {
  BrandFormInput,
} from "../validators/brand.schema";



class BrandService {


  generateId(): string {

    return crypto.randomUUID();

  }



  getBrands(): Brand[] {

    return brandRepository.findAll();

  }



  getBrandById(
    id: string,
  ): Brand | undefined {

    return brandRepository.findById(
      id,
    );

  }



  createBrand(

    input: BrandFormInput,

    tenantId: string,

    storeId: string,

  ): Brand {


    const now =
      new Date().toISOString();



    const brand: Brand = {


      id:
        this.generateId(),


      tenantId,


      storeId,


      name:
        input.name,


      description:
        input.description ?? null,


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

    id: string,

    updates: Partial<Brand>,

  ): Brand | undefined {


    return brandRepository.update(
      id,
      updates,
    );

  }



  deleteBrand(
    id: string,
  ): boolean {

    return brandRepository.delete(
      id,
    );

  }


}



export const brandService =
  new BrandService();