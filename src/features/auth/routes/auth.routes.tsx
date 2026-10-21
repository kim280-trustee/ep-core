/* eslint-disable react-refresh/only-export-components -- Route config modules intentionally define lazy page components and export route objects. */
import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

const LoginPage = lazy(() => import("../pages/LoginPage").then(({ LoginPage }) => ({ default: LoginPage })));

export const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];
