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

  categorySchema,

} from "../validators/category.schema";



import {

  CategoryStatus,

} from "../types/category.types";



import type {

  Category,

  CreateCategoryDto,

  UpdateCategoryDto,

} from "../types/category.types";







class CategoryService {







  private generateId(): string {


    return crypto.randomUUID();


  }









  getCategories(): Category[] {


    return categoryRepository.findAll();


  }









  getCategoryById(

    id:string,

  ):Category | undefined {


    return categoryRepository.findById(

      id,

    );


  }









  createCategory(

    input:CreateCategoryDto,

    tenantId:string,

    storeId:string,

  ):Category {




    const validated =

      categorySchema.parse(

        input,

      );






    const duplicate =

      this.getCategories()

        .find(

          category =>

            category.tenantId === tenantId &&

            category.storeId === storeId &&

            category.name.toLowerCase() ===

            validated.name.toLowerCase(),

        );







    if(duplicate){


      throw new Error(

        "Category with this name already exists.",

      );


    }









    const now =

      new Date().toISOString();







    const category:Category = {



      id:

        this.generateId(),



      tenantId,



      storeId,



      name:

        validated.name,



      description:

        validated.description ?? null,



      parentId:

        validated.parentId ?? null,



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

    id:string,

    updates:UpdateCategoryDto,

  ):Category | undefined {



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

    id:string,

  ):boolean {



    return categoryRepository.delete(

      id,

    );


  }







}








export const categoryService =

  new CategoryService();