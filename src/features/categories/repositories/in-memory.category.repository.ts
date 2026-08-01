/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 * ------------------------------------------------------------
 * In Memory Category Repository
 * ============================================================
 */

import type {
  Category,
} from "../types/category.types";


import type {
  ICategoryRepository,
} from "./category.repository";


class InMemoryCategoryRepository
implements ICategoryRepository {


  private categories: Category[] = [];



  findAll(): Category[] {

    return this.categories;

  }



  findById(
    id: string,
  ): Category | undefined {

    return this.categories.find(
      (category) =>
        category.id === id,
    );

  }



  create(
    category: Category,
  ): Category {

    this.categories.push(
      category,
    );

    return category;

  }



  update(
    id: string,
    updates: Partial<Category>,
  ): Category | undefined {

    const index =
      this.categories.findIndex(
        (category) =>
          category.id === id,
      );


    if (index === -1) {

      return undefined;

    }


    this.categories[index] = {

      ...this.categories[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };


    return this.categories[index];

  }



  delete(
    id: string,
  ): boolean {

    const index =
      this.categories.findIndex(
        (category) =>
          category.id === id,
      );


    if (index === -1) {

      return false;

    }


    this.categories.splice(
      index,
      1,
    );


    return true;

  }

}


export const inMemoryCategoryRepository =
  new InMemoryCategoryRepository();