import type {
  RouteObject,
} from "react-router-dom";

import {
  AppLayout,
} from "../layout";

import {
  productRoutes,
} from "../../features/products/routes/product.routes";

import {
  categoryRoutes,
} from "../../features/categories/routes/category.routes";

import {
  brandRoutes,
} from "../../features/brands/routes/brand.routes";

import {
  unitRoutes,
} from "../../features/units/routes/unit.routes";

import {
  supplierRoutes,
} from "../../features/suppliers/routes/supplier.routes";

import {
  customerRoutes,
} from "../../features/customers/routes/customer.routes";

import {
  warehouseRoutes,
} from "../../features/warehouses/routes/warehouse.routes";

import {
  taxRoutes,
} from "../../features/taxes/routes/tax.routes";

import {
  paymentMethodRoutes,
} from "../../features/payment-methods/routes/payment-method.routes";

import {
  inventoryRoutes,
} from "../../features/inventory/routes/inventory.routes";



export const routes: RouteObject[] = [


  {

    path: "/",

    element: (

      <AppLayout>

        <div>

          Dashboard

        </div>

      </AppLayout>

    ),

  },


  ...productRoutes,

  ...categoryRoutes,

  ...brandRoutes,

  ...unitRoutes,

  ...supplierRoutes,

  ...customerRoutes,

  ...warehouseRoutes,

  ...taxRoutes,

  ...paymentMethodRoutes,

  ...inventoryRoutes,


  {

    path: "*",

    element: (

      <div>

        Page Not Found

      </div>

    ),

  },

];