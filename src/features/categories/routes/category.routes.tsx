import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  CategoriesPage,
} from "../pages/CategoriesPage";


import {
  CreateCategoryPage,
} from "../pages/CreateCategoryPage";


import {
  EditCategoryPage,
} from "../pages/EditCategoryPage";



export const categoryRoutes: RouteObject[] = [

  {

    path: "/categories",

    element: (

      <AppLayout>

        <CategoriesPage />

      </AppLayout>

    ),

  },


  {

    path: "/categories/create",

    element: (

      <AppLayout>

        <CreateCategoryPage />

      </AppLayout>

    ),

  },


  {

    path: "/categories/edit/:id",

    element: (

      <AppLayout>

        <EditCategoryPage />

      </AppLayout>

    ),

  },

];