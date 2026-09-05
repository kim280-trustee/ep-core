import type { RouteObject } from "react-router-dom";
import GoodsReceiptsPage from "../pages/GoodsReceiptsPage";
import CreateGoodsReceiptPage from "../pages/CreateGoodsReceiptPage";
import GoodsReceiptDetailsPage from "../pages/GoodsReceiptDetailsPage";

export const purchaseReceivingRoutes: RouteObject[] = [
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
