import type { RouteObject } from "react-router-dom";
import ParentProgressPage from "../pages/ParentProgressPage";
import ParentInvitationPage from "../pages/ParentInvitationPage";

export const learningParentRoutes: RouteObject[] = [
  { path: "parent", element: <ParentProgressPage /> },
  { path: "parent/invite", element: <ParentInvitationPage /> },
];
