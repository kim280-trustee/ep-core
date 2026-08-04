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
  Outlet,
} from "react-router-dom";


import {
  AppLayout,
} from "../layout";


import {
  ProtectedRoute,
} from "@/core/auth";



import {
  authRoutes,
} from "../../features/auth/routes/auth.routes";


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


import {
  purchasingRoutes,
} from "../../features/purchasing/routes/purchasing.routes";


import {
  goodsReceiptRoutes,
} from "../../features/purchase-receiving/routes/goods-receipt.routes";


import {
  salesRoutes,
} from "../../features/sales/routes/sales.routes";


import {
  paymentRoutes,
} from "../../features/payments/routes/payment.routes";


import {
  receiptRoutes,
} from "../../features/receipts/routes/receipt.routes";


import {
  dashboardRoutes,
} from "../../features/dashboard/routes/dashboard.routes";


import {
  settingsRoutes,
} from "../../features/settings/routes/settings.routes";






function ProtectedLayout() {

  return (

    <ProtectedRoute>

      <AppLayout>

        <Outlet />

      </AppLayout>

    </ProtectedRoute>

  );

}






export const routes: RouteObject[] = [



  // Public routes

  ...authRoutes,





  // Protected application routes

  {

    path: "/",

    element: <ProtectedLayout />,


    children: [



      {

        index: true,

        element: (

          <div>

            Dashboard

          </div>

        ),

      },



      // Master Data

      ...productRoutes,

      ...categoryRoutes,

      ...brandRoutes,

      ...unitRoutes,

      ...supplierRoutes,

      ...customerRoutes,

      ...warehouseRoutes,

      ...taxRoutes,

      ...paymentMethodRoutes,



      // Operations

      ...inventoryRoutes,

      ...purchasingRoutes,

      ...goodsReceiptRoutes,

      ...salesRoutes,

      ...paymentRoutes,

      ...receiptRoutes,



      // System

      ...dashboardRoutes,

      ...settingsRoutes,


    ],

  },





  {

    path: "*",

    element: (

      <div>

        Page Not Found

      </div>

    ),

  },


];