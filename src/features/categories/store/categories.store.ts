/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Store
 * ============================================================
 */


import {
  create,
} from "zustand";


import {
  categoryService,
} from "../services/category.service";


import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";





interface CategoriesStore {


  categories: Category[];


  search: string;



  loadCategories: () => void;



  createCategory: (

    input: CreateCategoryDto,

    tenantId: string,

    storeId: string,

  ) => void;



  updateCategory: (

    id: string,

    updates: UpdateCategoryDto,

  ) => void;



  deleteCategory: (

    id: string,

  ) => void;



  setSearch: (

    value: string,

  ) => void;



}








export const useCategoriesStore =

create<CategoriesStore>(

(set)=>({




  categories: [],



  search: "",







  loadCategories(){


    set({

      categories:

        categoryService.getCategories(),

    });


  },









  createCategory(

    input,

    tenantId,

    storeId,

  ){


    categoryService.createCategory(

      input,

      tenantId,

      storeId,

    );


    set({

      categories:

        categoryService.getCategories(),

    });


  },









  updateCategory(

    id,

    updates,

  ){


    categoryService.updateCategory(

      id,

      updates,

    );


    set({

      categories:

        categoryService.getCategories(),

    });


  },









  deleteCategory(

    id,

  ){


    categoryService.deleteCategory(

      id,

    );


    set({

      categories:

        categoryService.getCategories(),

    });


  },









  setSearch(

    value,

  ){


    set({

      search:value,

    });


  },





})

);