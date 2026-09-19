import type { RouteObject } from "react-router-dom";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherClassPage from "../pages/TeacherClassPage";
import CreateTeacherAssignmentPage from "../pages/CreateTeacherAssignmentPage";

export const learningTeacherRoutes: RouteObject[] = [
  { path: "teacher", element: <TeacherDashboardPage /> },
  { path: "teacher/classes/:classGroupId", element: <TeacherClassPage /> },
  { path: "teacher/assignments/new", element: <CreateTeacherAssignmentPage /> },
];
