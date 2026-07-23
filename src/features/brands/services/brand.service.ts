import {
  brandRepository,
} from "../repositories";


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

    return brandRepository.findById(id);

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
        input.description,


      status:
        "active",


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

  ) {


    return brandRepository.update(
      id,
      updates,
    );

  }



  deleteBrand(
    id: string,
  ): boolean {

    return brandRepository.delete(id);

  }


}



export const brandService =
  new BrandService();