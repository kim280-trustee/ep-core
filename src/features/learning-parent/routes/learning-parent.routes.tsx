import type { RouteObject } from "react-router-dom";
import ParentLayout from "../layouts/ParentLayout";
import ParentProgressPage from "../pages/ParentProgressPage";
import ParentInvitationPage from "../pages/ParentInvitationPage";

export const learningParentRoutes: RouteObject[] = [
  {
    path: "parent",
    element: <ParentLayout />,
    children: [
      { index: true, element: <ParentProgressPage /> },
      { path: "invite", element: <ParentInvitationPage /> },
    ],
  },
];
