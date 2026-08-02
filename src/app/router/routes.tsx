/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Application Routes
 * ============================================================
 */


import type {

  RouteObject,

} from "react-router-dom";



import {

  productRoutes,

} from "../../features/products/routes/product.routes";



import {

  categoryRoutes,

} from "../../features/categories/routes/category.routes";



import {

  brandRoutes,

} from "../../features/brands/routes/brand.routes";







export const routes:RouteObject[] = [



  {


    path:"/",


    element:(

      <div>

        Dashboard

      </div>

    ),


  },






  ...productRoutes,



  ...categoryRoutes,



  ...brandRoutes,



];