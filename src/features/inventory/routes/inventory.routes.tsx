import {
  InventoryPage,
} from "../pages/InventoryPage";


import {
  InventoryHistoryPage,
} from "../pages/InventoryHistoryPage";


import {
  SellStockPage,
} from "../pages/SellStockPage";


export const inventoryRoutes = [

  {
    path: "/inventory",
    element: <InventoryPage />,
  },


  {
    path: "/inventory/history",
    element: <InventoryHistoryPage />,
  },


  {
    path: "/inventory/sell",
    element: <SellStockPage />,
  },

];
