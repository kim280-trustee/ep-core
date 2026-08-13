import {
  InventoryPage,
} from "../pages/InventoryPage";


import {
  InventoryHistoryPage,
} from "../pages/InventoryHistoryPage";


export const inventoryRoutes = [

  {
    path: "/inventory",
    element: <InventoryPage />,
  },


  {
    path: "/inventory/history",
    element: <InventoryHistoryPage />,
  },

];