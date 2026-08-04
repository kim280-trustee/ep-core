/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Purchase Receiving Module
 * ------------------------------------------------------------
 * Goods Receipt Routes
 * ============================================================
 */


import type {
  RouteObject,
} from "react-router-dom";


import GoodsReceiptsPage from "../pages/GoodsReceiptsPage";

import CreateGoodsReceiptPage from "../pages/CreateGoodsReceiptPage";

import GoodsReceiptDetailsPage from "../pages/GoodsReceiptDetailsPage";



export const goodsReceiptRoutes: RouteObject[] = [


  {

    path: "/purchase-receiving",

    element: <GoodsReceiptsPage />,

  },


  {

    path: "/purchase-receiving/create",

    element: <CreateGoodsReceiptPage />,

  },


  {

    path: "/purchase-receiving/:id",

    element: <GoodsReceiptDetailsPage />,

  },


];