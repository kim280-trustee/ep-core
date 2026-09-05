import type {
  RouteObject,
} from "react-router-dom";

import PurchaseReturnsPage from "../pages/PurchaseReturnsPage";
import CreatePurchaseReturnPage from "../pages/CreatePurchaseReturnPage";
import PurchaseReturnDetailsPage from "../pages/PurchaseReturnDetailsPage";

export const purchaseReturnRoutes: RouteObject[] = [
  {
    path: "/purchasing/returns",
    element: <PurchaseReturnsPage />,
  },
  {
    path: "/purchasing/returns/create",
    element: <CreatePurchaseReturnPage />,
  },
  {
    path: "/purchasing/returns/:id",
    element: <PurchaseReturnDetailsPage />,
  },
];
