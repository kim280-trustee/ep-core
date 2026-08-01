import type {
  RouteObject,
} from "react-router-dom";

import ReceiptsPage from "../pages/ReceiptsPage";

export const receiptRoutes: RouteObject[] = [

  {

    path: "/receipts",

    element:

      <ReceiptsPage />,

  },

];