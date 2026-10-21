import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/LoginPage").then(({ LoginPage }) => ({ default: LoginPage })));

export const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];
