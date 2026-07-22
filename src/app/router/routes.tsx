import type {
  RouteObject,
} from "react-router-dom";

import {
  AppLayout,
} from "../layout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AppLayout>
        <div>
          Dashboard
        </div>
      </AppLayout>
    ),
  },

  {
    path: "*",
    element: (
      <div>
        Page Not Found
      </div>
    ),
  },
];