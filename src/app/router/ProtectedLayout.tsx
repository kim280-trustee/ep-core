import {
  Outlet,
} from "react-router-dom";

import {
  AppLayout,
} from "../layout";

import {
  ProtectedRoute,
} from "@/core/auth";


export function ProtectedLayout() {

  return (

    <ProtectedRoute>

      <AppLayout>

        <Outlet />

      </AppLayout>

    </ProtectedRoute>

  );

}
