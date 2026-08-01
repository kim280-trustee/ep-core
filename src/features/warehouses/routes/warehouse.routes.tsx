import {
  WarehousesPage,
} from "../pages/WarehousesPage";


import {
  CreateWarehousePage,
} from "../pages/CreateWarehousePage";


import {
  EditWarehousePage,
} from "../pages/EditWarehousePage";



export const warehouseRoutes = [


  {

    path:
      "/warehouses",

    element:
      <WarehousesPage/>,

  },


  {

    path:
      "/warehouses/create",

    element:
      <CreateWarehousePage/>,

  },


  {

    path:
      "/warehouses/:id/edit",

    element:
      <EditWarehousePage/>,

  },


];