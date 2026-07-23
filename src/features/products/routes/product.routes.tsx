import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  ProductsPage,
} from "../pages/ProductsPage";


import {
  CreateProductPage,
} from "../pages/CreateProductPage";


import {
  EditProductPage,
} from "../pages/EditProductPage";


export const productRoutes: RouteObject[] = [

  {
    path: "/products",

    element: (

      <AppLayout>

        <ProductsPage />

      </AppLayout>

    ),

  },


  {
    path: "/products/create",

    element: (

      <AppLayout>

        <CreateProductPage />

      </AppLayout>

    ),

  },


  {
    path: "/products/edit/:id",

    element: (

      <AppLayout>

        <EditProductPage />

      </AppLayout>

    ),

  },

];