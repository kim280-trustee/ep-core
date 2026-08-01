/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 * ------------------------------------------------------------
 * Category Business Service
 * ============================================================
 */


import {
  categoryRepository,
} from "../repositories";


import {
  CategoryStatus,
} from "../types/category.types";


import type {
  Category,
} from "../types/category.types";


import type {
  CategoryFormInput,
} from "../validators/category.schema";



class CategoryService {



  generateId(): string {

    return crypto.randomUUID();

  }





  getCategories(): Category[] {

    return categoryRepository.findAll();

  }





  getCategoryById(

    id: string,

  ): Category | undefined {

    return categoryRepository.findById(
      id,
    );

  }





  createCategory(

    input: CategoryFormInput,

    tenantId: string,

    storeId: string,

  ): Category {


    const now =
      new Date().toISOString();



    const category: Category = {


      id:
        this.generateId(),



      tenantId,



      storeId,



      name:
        input.name,



      description:
        input.description ?? null,



      parentId:
        input.parentId ?? null,



      status:
        CategoryStatus.ACTIVE,



      createdAt:
        now,



      updatedAt:
        now,


    };



    return categoryRepository.create(
      category,
    );

  }





  updateCategory(

    id: string,

    updates: Partial<Category>,

  ): Category | undefined {


    return categoryRepository.update(

      id,

      {

        ...updates,

        updatedAt:
          new Date().toISOString(),

      },

    );

  }





  deleteCategory(

    id: string,

  ): boolean {


    return categoryRepository.delete(
      id,
    );

  }


}





export const categoryService =
  new CategoryService();