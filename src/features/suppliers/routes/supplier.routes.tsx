import {
  SuppliersPage,
} from "../pages/SuppliersPage";


import {
  CreateSupplierPage,
} from "../pages/CreateSupplierPage";


import {
  EditSupplierPage,
} from "../pages/EditSupplierPage";



export const supplierRoutes = [

  {

    path:
      "/suppliers",

    element:
      <SuppliersPage />,

  },


  {

    path:
      "/suppliers/create",

    element:
      <CreateSupplierPage />,

  },


  {

    path:
      "/suppliers/:id/edit",

    element:
      <EditSupplierPage />,

  },

];