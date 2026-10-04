import type { RouteObject } from "react-router-dom";
import ParentProgressPage from "../pages/ParentProgressPage";

export const learningParentRoutes: RouteObject[] = [
  { path: "parent", element: <ParentProgressPage /> },
];
