import {
  InventoryPage,
} from "../pages/InventoryPage";

import {
  InventoryHistoryPage,
} from "../pages/InventoryHistoryPage";

import {
  SellStockPage,
} from "../pages/SellStockPage";

import {
  InventoryLedgerPage,
} from "../../inventory-ledger/pages/InventoryLedgerPage";


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

  {
    path: "/inventory/ledger",
    element: <InventoryLedgerPage />,
  },

];
