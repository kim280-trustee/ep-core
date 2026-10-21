/* eslint-disable react-refresh/only-export-components -- Route config modules intentionally define lazy page components and export route objects. */
import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import ParentLayout from "../layouts/ParentLayout";

import { lazy } from "react";

const ParentProgressPage = lazy(() => import("../pages/ParentProgressPage"));
const ParentInvitationPage = lazy(() => import("../pages/ParentInvitationPage"));

export const learningParentRoutes: RouteObject[] = [
  {
    path: "parent",
    element: (
      <ProtectedRoute>
        <ParentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ParentProgressPage /> },
      { path: "invite", element: <ParentInvitationPage /> },
    ],
  },
];
