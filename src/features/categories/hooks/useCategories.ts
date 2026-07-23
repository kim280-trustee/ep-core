import {
  useState,
} from "react";


import {
  categoryService,
} from "../services/category.service";


export function useCategories() {


  const [
    categories,
    setCategories,
  ] = useState(
    categoryService.getCategories(),
  );



  function refresh() {

    setCategories(
      categoryService.getCategories(),
    );

  }



  function removeCategory(
    id: string,
  ) {

    categoryService.deleteCategory(
      id,
    );

    refresh();

  }



  return {

    categories,

    refresh,

    removeCategory,

  };

}