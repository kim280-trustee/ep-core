import type {
  Category,
} from "../types/category.types";


export interface ICategoryRepository {


  findAll(): Category[];


  findById(
    id: string,
  ): Category | undefined;



  create(
    category: Category,
  ): Category;



  update(
    id: string,
    updates: Partial<Category>,
  ): Category | undefined;



  delete(
    id: string,
  ): boolean;

}