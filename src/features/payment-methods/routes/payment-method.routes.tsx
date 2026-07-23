import type {
  RouteObject,
} from "react-router-dom";

import {
  AppLayout,
} from "../../../app/layout";

import {
  PaymentMethodsPage,
} from "../pages/PaymentMethodsPage";

import {
  CreatePaymentMethodPage,
} from "../pages/CreatePaymentMethodPage";

import {
  EditPaymentMethodPage,
} from "../pages/EditPaymentMethodPage";

export const paymentMethodRoutes: RouteObject[] = [

  {
    path: "/payment-methods",

    element: (
      <AppLayout>
        <PaymentMethodsPage />
      </AppLayout>
    ),

  },

  {
    path: "/payment-methods/create",

    element: (
      <AppLayout>
        <CreatePaymentMethodPage />
      </AppLayout>
    ),

  },

  {
    path: "/payment-methods/edit/:id",

    element: (
      <AppLayout>
        <EditPaymentMethodPage />
      </AppLayout>
    ),

  },

];