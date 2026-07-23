import {
  categoryRepository,
} from "../repositories";


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

    return categoryRepository.findById(id);

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
        input.description,


      status:
        "active",


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

  ) {


    return categoryRepository.update(
      id,
      updates,
    );

  }




  deleteCategory(
    id: string,
  ): boolean {

    return categoryRepository.delete(id);

  }


}



export const categoryService =
  new CategoryService();