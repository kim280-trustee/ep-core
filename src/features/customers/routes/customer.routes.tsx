import {
  CustomersPage,
} from "../pages/CustomersPage";

import {
  CreateCustomerPage,
} from "../pages/CreateCustomerPage";

import {
  EditCustomerPage,
} from "../pages/EditCustomerPage";


export const customerRoutes = [

  {
    path:
      "/customers",

    element:
      <CustomersPage />,
  },


  {
    path:
      "/customers/create",

    element:
      <CreateCustomerPage />,
  },


  {
    path:
      "/customers/:id/edit",

    element:
      <EditCustomerPage />,
  },

];
