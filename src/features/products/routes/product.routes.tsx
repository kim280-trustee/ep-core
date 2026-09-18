/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Routes
 * ============================================================
 */

import type { RouteObject } from "react-router-dom";

import { ProductsPage } from "../pages/ProductsPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductEditPage } from "../pages/ProductEditPage";
import { ProductImportPage } from "../pages/ProductImportPage";

export const productRoutes: RouteObject[] = [
  {
    path: "products",
    element: <ProductsPage />,
  },
  {
    path: "products/import",
    element: <ProductImportPage />,
  },
  {
    path: "products/:id",
    element: <ProductDetailsPage />,
  },
  {
    path: "products/:id/edit",
    element: <ProductEditPage />,
  },
];