import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import ParentLayout from "../layouts/ParentLayout";
import ParentProgressPage from "../pages/ParentProgressPage";
import ParentInvitationPage from "../pages/ParentInvitationPage";
import ParentAnnouncementsPage from "../pages/ParentAnnouncementsPage";

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
      { path: "announcements", element: <ParentAnnouncementsPage /> },
    ],
  },
];
