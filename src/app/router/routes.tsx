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
  ProtectedLayout,
} from "./ProtectedLayout";


// Auth
import {
  authRoutes,
} from "../../features/auth/routes/auth.routes";


// Master Data
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


// Operations
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
  purchaseReturnRoutes,
} from "../../features/purchasing/purchase-returns/routes/purchase-return.routes";

import {
  salesRoutes,
} from "../../features/sales/routes/sales.routes";

import {
  posSalesRoutes,
} from "../../features/pos-sales/routes/pos-sales.routes";

import {
  paymentRoutes,
} from "../../features/payments/routes/payment.routes";

import {
  receiptRoutes,
} from "../../features/receipts/routes/receipt.routes";


// Expenses
import {
  expenseRoutes,
} from "../../features/expenses/routes/expense.routes";


// System
import {
  dashboardRoutes,
} from "../../features/dashboard/routes/dashboard.routes";

import {
  settingsRoutes,
} from "../../features/settings/routes/settings.routes";

import {
  reportsRoutes,
} from "../../features/reports/routes/reports.routes";


export const routes: RouteObject[] = [

  // Public
  ...authRoutes,


  // Protected Application
  {
    path: "/",

    element: <ProtectedLayout />,

    children: [

      // Dashboard
      ...dashboardRoutes,


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

      ...purchaseReturnRoutes,

      ...salesRoutes,

      ...posSalesRoutes,

      ...paymentRoutes,

      ...receiptRoutes,


      // Expenses
      ...expenseRoutes,


      // Reports
      ...reportsRoutes,


      // System
      ...settingsRoutes,

    ],

  },


  // Not Found
  {
    path: "*",

    element: (

      <div>

        Page Not Found

      </div>

    ),

  },

];





